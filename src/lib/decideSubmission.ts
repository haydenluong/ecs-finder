import 'server-only';
import { getSupabaseAdmin } from '@/../utils/supabase/admin';
import { translateDesc } from '@/lib/translateDesc';
import { sendMail } from '@/lib/mailer';
import { approvedEmail, rejectedEmail } from '@/lib/submissionEmails';
import { deleteActivityImages } from '@/lib/activityImages';

const ACTIONS = {
    approve: 'approved',
    reject: 'rejected',
} as const;

export type DecisionAction = keyof typeof ACTIONS;

export type DecisionResult =
    | { outcome: 'decided'; action: DecisionAction; name: string }
    | { outcome: 'already-decided'; status: string; name: string }
    | { outcome: 'not-found' }
    | { outcome: 'failed' };

export function isDecisionAction(value: unknown): value is DecisionAction {
    return typeof value === 'string' && value in ACTIONS;
}

export interface DecideOptions {
    onlyIfStatus?: 'pending';
}

export async function decideSubmission(
    id: number,
    action: DecisionAction,
    reviewedBy: string,
    options: DecideOptions = {},
): Promise<DecisionResult> {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: row, error: readError } = await supabaseAdmin
        .from('activities_submissions')
        .select('name, email, image, desc, desc_en, status')
        .eq('id', id)
        .maybeSingle();

    if (readError) {
        console.error('Decision read failed:', readError);
        return { outcome: 'failed' };
    }
    if (!row) {
        return { outcome: 'not-found' };
    }

    if (options.onlyIfStatus && row.status !== options.onlyIfStatus) {
        return { outcome: 'already-decided', status: row.status, name: row.name };
    }

    let descEn: string | null = null;
    if (action === 'approve' && !row.desc_en) {
        descEn = await translateDesc(row.desc);
    }

    let update = supabaseAdmin
        .from('activities_submissions')
        .update({
            status: ACTIONS[action],
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString(),
            ...(descEn ? { desc_en: descEn } : {}),
        })
        .eq('id', id);

    if (options.onlyIfStatus) {
        update = update.eq('status', options.onlyIfStatus);
    }

    const { data, error } = await update.select('id');

    if (error) {
        console.error('Decision update failed:', error);
        return { outcome: 'failed' };
    }

    if (!data || data.length === 0) {
        return options.onlyIfStatus
            ? { outcome: 'already-decided', status: row.status, name: row.name }
            : { outcome: 'not-found' };
    }

    if (action === 'reject') {
        await deleteActivityImages([row.image]);
    }

    if (row.email) {
        const notice = action === 'approve' ? approvedEmail(row.name) : rejectedEmail(row.name);
        await sendMail(row.email, notice.subject, notice.text);
    }

    return { outcome: 'decided', action, name: row.name };
}
