import 'server-only';
import { getSupabaseAdmin } from '@/../utils/supabase/admin';
import { EDITABLE_FIELDS, validateSubmissionFields, type EditableField } from '@/lib/submissionFields';

export type SubmissionPatch = Partial<Record<EditableField, unknown>>;

export type UpdateResult =
    | { outcome: 'updated'; name: string }
    | { outcome: 'invalid'; field: string; code: string }
    | { outcome: 'not-pending'; status: string; name: string }
    | { outcome: 'not-found' }
    | { outcome: 'failed' };

export function pickPatch(body: unknown): SubmissionPatch {
    if (!body || typeof body !== 'object') return {};

    const source = body as Record<string, unknown>;
    const patch: SubmissionPatch = {};

    for (const field of EDITABLE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(source, field)) {
            patch[field] = source[field];
        }
    }

    return patch;
}

export async function updateSubmission(id: number, patch: SubmissionPatch): Promise<UpdateResult> {
    if (Object.keys(patch).length === 0) {
        return { outcome: 'invalid', field: 'form', code: 'error.form.missingFields' };
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: row, error: readError } = await supabaseAdmin
        .from('activities_submissions')
        .select('name, category, topic, subtopic, location, deadline, desc, link, positions, status')
        .eq('id', id)
        .maybeSingle();

    if (readError) {
        console.error('Edit read failed:', readError);
        return { outcome: 'failed' };
    }
    if (!row) {
        return { outcome: 'not-found' };
    }
    if (row.status !== 'pending') {
        return { outcome: 'not-pending', status: row.status, name: row.name };
    }

    const validated = validateSubmissionFields({
        name: row.name,
        category: row.category,
        topic: row.topic,
        subtopic: row.subtopic,
        location: row.location,
        deadline: row.deadline,
        desc: row.desc,
        link: row.link,
        positions: row.positions ?? [],
        ...patch,
    });

    if (!validated.ok) {
        return { outcome: 'invalid', field: validated.field, code: validated.code };
    }

    const { data, error } = await supabaseAdmin
        .from('activities_submissions')
        .update(validated.value)
        .eq('id', id)
        .eq('status', 'pending')
        .select('id');

    if (error) {
        console.error('Edit update failed:', error);
        return { outcome: 'failed' };
    }
    if (!data || data.length === 0) {
        return { outcome: 'not-pending', status: row.status, name: row.name };
    }

    return { outcome: 'updated', name: validated.value.name };
}
