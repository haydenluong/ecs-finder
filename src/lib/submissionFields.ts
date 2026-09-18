import { categorySet, topicSet, POSITIONS } from '@/data/tagData';

export interface SubmissionFields {
    name: string;
    category: string;
    topic: string;
    subtopic: string | null;
    location: string;
    deadline: string;
    desc: string;
    link: string;
    positions: string[];
}

export type RawSubmissionFields = { [K in keyof SubmissionFields]: unknown };

export type FieldsResult =
    | { ok: true; value: SubmissionFields }
    | { ok: false; field: string; code: string };

export const EDITABLE_FIELDS = [
    'name',
    'category',
    'topic',
    'subtopic',
    'location',
    'deadline',
    'desc',
    'link',
    'positions',
] as const;

export type EditableField = (typeof EDITABLE_FIELDS)[number];

function text(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

export function validateSubmissionFields(raw: RawSubmissionFields): FieldsResult {
    const name = text(raw.name);
    const category = text(raw.category);
    const topic = text(raw.topic);
    const subtopic = text(raw.subtopic);
    const location = text(raw.location);
    const deadline = text(raw.deadline);
    const desc = text(raw.desc);
    const link = text(raw.link);

    if (!name || !category || !topic || !location || !deadline || !desc || !link) {
        return { ok: false, field: 'form', code: 'error.form.missingFields' };
    }

    const positions = raw.positions;
    if (!Array.isArray(positions) || !positions.every(p => typeof p === 'string' && POSITIONS.includes(p))) {
        return { ok: false, field: 'positions', code: 'error.positions.invalid' };
    }

    if (!categorySet.some(c => c.label === category)) {
        return { ok: false, field: 'category', code: 'error.category.invalid' };
    }

    const matchedTopic = topicSet.find(t => t.name === topic);
    if (!matchedTopic) {
        return { ok: false, field: 'topic', code: 'error.topic.invalid' };
    }
    if (subtopic && !matchedTopic.subtopics.includes(subtopic)) {
        return { ok: false, field: 'subtopic', code: 'error.subtopic.invalid' };
    }

    try {
        const url = new URL(link);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
    } catch {
        return { ok: false, field: 'link', code: 'error.link.invalidServer' };
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
        return { ok: false, field: 'deadline', code: 'error.deadline.invalid' };
    }

    return {
        ok: true,
        value: {
            name,
            category,
            topic,
            subtopic: subtopic || null,
            location,
            deadline,
            desc,
            link,
            positions: positions as string[],
        },
    };
}
