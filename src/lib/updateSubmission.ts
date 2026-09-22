import 'server-only';
import { getSupabaseAdmin } from '@/../utils/supabase/admin';
import { EDITABLE_FIELDS, validateSubmissionFields, type EditableField } from '@/lib/submissionFields';
import { translateDesc } from '@/lib/translateDesc';

export type SubmissionPatch = Partial<Record<EditableField, unknown>>;

export type EditableStatus = 'pending' | 'approved';

export interface UpdateOptions {
    editableStatuses?: readonly EditableStatus[];
}

export type UpdateResult =
    | { outcome: 'updated'; name: string }
    | { outcome: 'invalid'; field: string; code: string }
    | { outcome: 'not-editable'; status: string; name: string }
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

export async function updateSubmission(
    id: number,
    patch: SubmissionPatch,
    options: UpdateOptions = {},
): Promise<UpdateResult> {
    if (Object.keys(patch).length === 0) {
        return { outcome: 'invalid', field: 'form', code: 'error.form.missingFields' };
    }

    const editableStatuses = options.editableStatuses ?? (['pending'] as const);
    const supabaseAdmin = getSupabaseAdmin();

    const { data: row, error: readError } = await supabaseAdmin
        .from('activities_submissions')
        .select('name, category, topic, subtopic, location, deadline, desc, desc_en, link, positions, status')
        .eq('id', id)
        .maybeSingle();

    if (readError) {
        console.error('Edit read failed:', readError);
        return { outcome: 'failed' };
    }
    if (!row) {
        return { outcome: 'not-found' };
    }
    if (!editableStatuses.includes(row.status)) {
        return { outcome: 'not-editable', status: row.status, name: row.name };
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

    const retranslate = row.desc_en !== null && validated.value.desc !== row.desc;
    const translation = retranslate
        ? { desc_en: await translateDesc(validated.value.desc) }
        : {};

    const { data, error } = await supabaseAdmin
        .from('activities_submissions')
        .update({ ...validated.value, ...translation })
        .eq('id', id)
        .eq('status', row.status)
        .select('id');

    if (error) {
        console.error('Edit update failed:', error);
        return { outcome: 'failed' };
    }
    if (!data || data.length === 0) {
        return { outcome: 'not-editable', status: row.status, name: row.name };
    }

    return { outcome: 'updated', name: validated.value.name };
}
