import type { DecisionAction } from '@/lib/decideSubmission';
import { escapeHtml, sendMessage, type InlineButton, type InlineKeyboard } from '@/lib/telegram';
import { topicSet, categorySet, POSITIONS } from '@/data/tagData';

// what to say for the text introducing the submission 

const SITE_URL = 'https://timkiemhdnk.com';

const DESC_LIMIT = 700;
const FIELD_LIMIT = 120;

export interface SubmissionForNotice {
    id: number;
    name: string;
    category: string;
    topic: string;
    subtopic: string | null;
    location: string;
    deadline: string;
    desc: string;
    link: string;
    email: string;
    positions: string[];
    image: string;
    linkCheckPassed: boolean;
    contentCheckVerdict: string | null;
    contentCheckReason: string | null;
}

export interface SubmissionNotice {
    text: string;
    replyMarkup: InlineKeyboard;
    previewImage?: string;
}

function html(value: string, limit: number): string {
    const escaped = escapeHtml(value.trim());
    if (escaped.length <= limit) return escaped;

    const cut = escaped.slice(0, limit).replace(/&[a-z]*$/, '');
    const lastSpace = cut.lastIndexOf(' ');
    return `${lastSpace > limit * 0.7 ? cut.slice(0, lastSpace) : cut}…`;
}

function formatDeadline(iso: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : iso;
}

function contentSignal(verdict: string | null): string {
    switch (verdict) {
        case 'ok': return '🟢 Nội dung: ổn';
        case 'spam': return '🔴 Nội dung: nghi spam';
        case 'review': return '🟠 Nội dung: cần xem kỹ';
        default: return '⚪ Nội dung: chưa kiểm tra';
    }
}

function linkSignal(passed: boolean): string {
    return passed ? '🟢 Liên kết: mở được' : '🟠 Liên kết: không mở được';
}

export function newSubmissionNotice(s: SubmissionForNotice): SubmissionNotice {
    const taxonomy = s.subtopic ? `${s.topic} › ${s.subtopic}` : s.topic;

    const lines = [
        `<b>${html(s.name, FIELD_LIMIT)}</b>`,
        '',
        `${html(s.category, FIELD_LIMIT)} · ${html(taxonomy, FIELD_LIMIT)}`,
        `📍 ${html(s.location, FIELD_LIMIT)}`,
        `🗓 Hạn ${html(formatDeadline(s.deadline), FIELD_LIMIT)}`,
        s.positions.length > 0 ? `👥 ${html(s.positions.join(', '), FIELD_LIMIT)}` : null,
        '',
        html(s.desc, DESC_LIMIT),
        '',
        `🔗 ${html(s.link, FIELD_LIMIT)}`,
        `✉️ ${html(s.email, FIELD_LIMIT)}`,
        '',
        contentSignal(s.contentCheckVerdict),
        s.contentCheckReason ? `<i>${html(s.contentCheckReason, FIELD_LIMIT)}</i>` : null,
        linkSignal(s.linkCheckPassed),
        '',
        `#${s.id} · <a href="${SITE_URL}/admin">Xem đầy đủ trên /admin</a>`,
    ];

    return {
        text: lines.filter(line => line !== null).join('\n'),
        replyMarkup: {
            inline_keyboard: [
                [
                    { text: '✅ Duyệt', callback_data: `a:${s.id}` },
                    { text: '❌ Từ chối', callback_data: `r?:${s.id}` },
                ],
                [
                    { text: '✏️ Sửa', callback_data: `e:${s.id}` },
                ],
            ],
        },
        previewImage: s.image,
    };
}

export function confirmRejectNotice(id: number, name: string): SubmissionNotice {
    return {
        text: [
            `⚠️ Từ chối <b>${html(name, FIELD_LIMIT)}</b>?`,
            '',
            'Ảnh sẽ bị xoá vĩnh viễn và người gửi sẽ nhận email báo từ chối.',
        ].join('\n'),
        replyMarkup: {
            inline_keyboard: [[
                { text: '❌ Xác nhận từ chối', callback_data: `r!:${id}` },
                { text: '↩️ Huỷ', callback_data: `x:${id}` },
            ]],
        },
    };
}

export function decidedNotice(name: string, action: DecisionAction, by: string): string {
    const verb = action === 'approve' ? '✅ Đã duyệt' : '❌ Đã từ chối';
    const when = new Date().toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    return `${verb} <b>${html(name, FIELD_LIMIT)}</b>\n${html(by, FIELD_LIMIT)} · ${when}`;
}

export function alreadyDecidedNotice(name: string, status: string): string {
    const label: Record<string, string> = {
        approved: 'đã được duyệt',
        rejected: 'đã bị từ chối',
        archived: 'đã hết hạn và được lưu trữ',
        pending: 'vẫn đang chờ duyệt',
    };
    return `ℹ️ <b>${html(name, FIELD_LIMIT)}</b> ${label[status] ?? 'đã được xử lý'} rồi.`;
}

function choiceKeyboard(
    options: string[],
    current: string | null,
    callback: (index: number) => string,
    perRow: number,
    extraRows: InlineButton[][],
): InlineKeyboard {
    const buttons: InlineButton[] = options.map((option, index) => ({
        text: `${option === current ? '✓ ' : ''}${option}`,
        callback_data: callback(index),
    }));

    const rows: InlineButton[][] = [];
    for (let i = 0; i < buttons.length; i += perRow) {
        rows.push(buttons.slice(i, i + perRow));
    }

    return { inline_keyboard: [...rows, ...extraRows] };
}

export function editMenuNotice(s: SubmissionForNotice): SubmissionNotice {
    const taxonomy = s.subtopic ? `${s.topic} › ${s.subtopic}` : s.topic;

    return {
        text: [
            `✏️ Sửa <b>${html(s.name, FIELD_LIMIT)}</b>`,
            '',
            `🏷 ${html(s.category, FIELD_LIMIT)}`,
            `🧭 ${html(taxonomy, FIELD_LIMIT)}`,
            `👥 ${s.positions.length > 0 ? html(s.positions.join(', '), FIELD_LIMIT) : '—'}`,
            '',
            'Tên, mô tả, địa điểm, hạn và liên kết sửa trên /admin.',
        ].join('\n'),
        replyMarkup: {
            inline_keyboard: [
                [
                    { text: '🏷 Loại hình', callback_data: `ec:${s.id}` },
                    { text: '🧭 Chủ đề', callback_data: `et:${s.id}` },
                ],
                [
                    { text: '🔖 Chủ đề phụ', callback_data: `es:${s.id}` },
                    { text: '👥 Vị trí', callback_data: `ep:${s.id}` },
                ],
                [
                    { text: '✏️ Sửa đầy đủ trên /admin', url: `${SITE_URL}/admin` },
                ],
                [
                    { text: '↩️ Quay lại', callback_data: `x:${s.id}` },
                ],
            ],
        },
    };
}

export function categoryChoiceNotice(s: SubmissionForNotice): SubmissionNotice {
    return {
        text: `🏷 Chọn loại hình cho <b>${html(s.name, FIELD_LIMIT)}</b>`,
        replyMarkup: choiceKeyboard(
            categorySet.map(c => c.label),
            s.category,
            index => `ec:${s.id}:${index}`,
            1,
            [[{ text: '↩️ Quay lại', callback_data: `e:${s.id}` }]],
        ),
    };
}

export function topicChoiceNotice(s: SubmissionForNotice): SubmissionNotice {
    return {
        text: [
            `🧭 Chọn chủ đề cho <b>${html(s.name, FIELD_LIMIT)}</b>`,
            '',
            '<i>Đổi chủ đề sẽ xoá chủ đề phụ hiện tại.</i>',
        ].join('\n'),
        replyMarkup: choiceKeyboard(
            topicSet.map(t => t.name),
            s.topic,
            index => `et:${s.id}:${index}`,
            1,
            [[{ text: '↩️ Quay lại', callback_data: `e:${s.id}` }]],
        ),
    };
}

export function subtopicChoiceNotice(s: SubmissionForNotice): SubmissionNotice {
    const subtopics = topicSet.find(t => t.name === s.topic)?.subtopics ?? [];

    return {
        text: `🔖 Chọn chủ đề phụ trong <b>${html(s.topic, FIELD_LIMIT)}</b>`,
        replyMarkup: choiceKeyboard(
            subtopics,
            s.subtopic,
            index => `es:${s.id}:${index}`,
            1,
            [
                [{ text: `${s.subtopic === null ? '✓ ' : ''}— Không có —`, callback_data: `es:${s.id}:n` }],
                [{ text: '↩️ Quay lại', callback_data: `e:${s.id}` }],
            ],
        ),
    };
}

export function positionChoiceNotice(s: SubmissionForNotice): SubmissionNotice {
    const buttons: InlineButton[] = POSITIONS.map((position, index) => ({
        text: `${s.positions.includes(position) ? '✓ ' : ''}${position}`,
        callback_data: `ep:${s.id}:${index}`,
    }));

    const rows: InlineButton[][] = [];
    for (let i = 0; i < buttons.length; i += 2) {
        rows.push(buttons.slice(i, i + 2));
    }

    return {
        text: [
            `👥 Vị trí tuyển của <b>${html(s.name, FIELD_LIMIT)}</b>`,
            '',
            'Chạm để bật/tắt từng vị trí.',
        ].join('\n'),
        replyMarkup: {
            inline_keyboard: [...rows, [{ text: '↩️ Xong', callback_data: `e:${s.id}` }]],
        },
    };
}

export function editFailedNotice(): string {
    return `⚠️ Không sửa được. Thử lại trên <a href="${SITE_URL}/admin">/admin</a>.`;
}

export function decisionFailedNotice(): string {
    return `⚠️ Không xử lý được. Thử lại trên <a href="${SITE_URL}/admin">/admin</a>.`;
}

export async function notifyNewSubmission(s: SubmissionForNotice): Promise<boolean> {
    const notice = newSubmissionNotice(s);
    return sendMessage(notice.text, notice.replyMarkup, notice.previewImage);
}
