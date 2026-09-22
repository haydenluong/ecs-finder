import { NextResponse, after } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from '@/../utils/supabase/admin';
import { decideSubmission, type DecisionAction } from '@/lib/decideSubmission';
import { updateSubmission, type SubmissionPatch } from '@/lib/updateSubmission';
import { topicSet, categorySet, POSITIONS } from '@/data/tagData';
import { allowedChatIds, answerCallbackQuery, editMessageText } from '@/lib/telegram';
import {
    newSubmissionNotice,
    confirmRejectNotice,
    decidedNotice,
    alreadyDecidedNotice,
    decisionFailedNotice,
    editMenuNotice,
    categoryChoiceNotice,
    topicChoiceNotice,
    subtopicChoiceNotice,
    positionChoiceNotice,
    editFailedNotice,
    type SubmissionForNotice,
} from '@/lib/submissionTelegram';

// webhook

export const runtime = 'nodejs';
export const maxDuration = 60;

const CALLBACK = /^(et|ec|es|ep|e|a|r\?|r!|x):(\d{1,15})(?::(\d{1,3}|n))?$/;

const EDIT_PREFIXES = ['e', 'et', 'ec', 'es', 'ep'];

type EditRow = SubmissionForNotice & { status: string };

function buildPatch(prefix: string, arg: string, row: EditRow): SubmissionPatch | null {
    if (prefix === 'es') {
        if (arg === 'n') return { subtopic: null };
        const subtopics = topicSet.find(t => t.name === row.topic)?.subtopics ?? [];
        const subtopic = subtopics[Number(arg)];
        return subtopic ? { subtopic } : null;
    }

    if (arg === 'n') return null;
    const index = Number(arg);

    if (prefix === 'ec') {
        const category = categorySet[index]?.label;
        return category ? { category } : null;
    }

    if (prefix === 'et') {
        const topic = topicSet[index]?.name;
        return topic ? { topic, subtopic: null } : null;
    }

    if (prefix === 'ep') {
        const position = POSITIONS[index];
        if (!position) return null;
        return {
            positions: row.positions.includes(position)
                ? row.positions.filter(p => p !== position)
                : [...row.positions, position],
        };
    }

    return null;
}

function choiceNotice(prefix: string, row: EditRow) {
    switch (prefix) {
        case 'ec': return categoryChoiceNotice(row);
        case 'et': return topicChoiceNotice(row);
        case 'es': return subtopicChoiceNotice(row);
        case 'ep': return positionChoiceNotice(row);
        default: return editMenuNotice(row);
    }
}

interface CallbackQuery {
    id: string;
    data?: string;
    from?: { id?: number; username?: string };
    message?: { message_id?: number; chat?: { id?: number } };
}

function isAuthorised(request: Request): boolean {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!secret || secret.length < 32) return false;

    const expected = Buffer.from(secret);
    const given = Buffer.from(request.headers.get('x-telegram-bot-api-secret-token') ?? '');
    return expected.length === given.length && timingSafeEqual(expected, given);
}

async function loadNotice(id: number): Promise<EditRow | null> {
    const { data, error } = await getSupabaseAdmin()
        .from('activities_submissions')
        .select('id, name, category, topic, subtopic, location, deadline, desc, link, email, positions, image, status, link_check_passed, content_check_verdict, content_check_reason')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('Telegram notice read failed:', error);
        return null;
    }
    if (!data) return null;

    return {
        id: data.id,
        name: data.name,
        category: data.category,
        topic: data.topic,
        subtopic: data.subtopic,
        location: data.location,
        deadline: data.deadline,
        desc: data.desc,
        link: data.link,
        email: data.email ?? '',
        positions: data.positions ?? [],
        image: data.image,
        status: data.status,
        linkCheckPassed: data.link_check_passed === true,
        contentCheckVerdict: data.content_check_verdict,
        contentCheckReason: data.content_check_reason,
    };
}

export async function POST(request: Request) {
    if (!isAuthorised(request)) {
        return new NextResponse(null, { status: 401 });
    }

    const allowedChats = allowedChatIds();
    if (allowedChats.length === 0) {
        console.error('Telegram not configured: TELEGRAM_CHAT_ID is required');
        return new NextResponse(null, { status: 401 });
    }

    let update: { callback_query?: CallbackQuery };
    try {
        update = await request.json();
    } catch {
        return NextResponse.json({ ok: true });
    }

    const cq = update.callback_query;
    if (!cq?.id) {
        return NextResponse.json({ ok: true });
    }

    const fromChat = String(cq.message?.chat?.id);
    if (!allowedChats.includes(fromChat) || String(cq.from?.id) !== fromChat) {
        console.error('Telegram callback from an unexpected chat or user');
        return new NextResponse(null, { status: 401 });
    }

    const match = CALLBACK.exec(cq.data ?? '');
    if (!match) {
        await answerCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
    }

    const [, prefix, rawId, arg] = match;
    const id = Number(rawId);
    if (!Number.isSafeInteger(id)) {
        await answerCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
    }

    const chatId = cq.message?.chat?.id;
    const messageId = cq.message?.message_id;
    const canEdit = chatId !== undefined && messageId !== undefined;
    const reviewedBy = `telegram:${cq.from?.username ?? cq.from?.id}`;

    const pending: Record<string, string> = {
        'a': 'Đang duyệt…',
        'r!': 'Đang từ chối…',
        'r?': '',
        'x': '',
    };
    const toast = arg !== undefined && EDIT_PREFIXES.includes(prefix)
        ? 'Đang lưu…'
        : pending[prefix] || undefined;
    await answerCallbackQuery(cq.id, toast);

    after(async () => {
        if (EDIT_PREFIXES.includes(prefix)) {
            const row = await loadNotice(id);
            if (!canEdit) return;
            if (!row) {
                await editMessageText(chatId, messageId, editFailedNotice());
                return;
            }
            if (row.status !== 'pending') {
                await editMessageText(chatId, messageId, alreadyDecidedNotice(row.name, row.status));
                return;
            }

            if (arg === undefined) {
                const notice = choiceNotice(prefix, row);
                await editMessageText(chatId, messageId, notice.text, notice.replyMarkup);
                return;
            }

            const patch = buildPatch(prefix, arg, row);
            if (!patch) {
                await editMessageText(chatId, messageId, editFailedNotice());
                return;
            }

            const result = await updateSubmission(id, patch);
            if (result.outcome === 'not-editable') {
                await editMessageText(chatId, messageId, alreadyDecidedNotice(result.name, result.status));
                return;
            }
            if (result.outcome !== 'updated') {
                await editMessageText(chatId, messageId, editFailedNotice());
                return;
            }

            const updated = await loadNotice(id);
            if (!updated) {
                await editMessageText(chatId, messageId, editFailedNotice());
                return;
            }
            const notice = prefix === 'ep' ? positionChoiceNotice(updated) : editMenuNotice(updated);
            await editMessageText(chatId, messageId, notice.text, notice.replyMarkup);
            return;
        }

        if (prefix === 'r?') {
            const row = await loadNotice(id);
            if (!canEdit) return;
            if (!row) {
                await editMessageText(chatId, messageId, decisionFailedNotice());
                return;
            }
            const notice = confirmRejectNotice(id, row.name);
            await editMessageText(chatId, messageId, notice.text, notice.replyMarkup);
            return;
        }

        if (prefix === 'x') {
            const row = await loadNotice(id);
            if (!canEdit) return;
            if (!row) {
                await editMessageText(chatId, messageId, decisionFailedNotice());
                return;
            }
            const notice = newSubmissionNotice(row);
            await editMessageText(chatId, messageId, notice.text, notice.replyMarkup, notice.previewImage);
            return;
        }

        const action: DecisionAction = prefix === 'a' ? 'approve' : 'reject';
        const result = await decideSubmission(id, action, reviewedBy, { onlyIfStatus: 'pending' });

        if (!canEdit) {
            console.error('Telegram callback had no message to edit; decision outcome:', result.outcome);
            return;
        }

        switch (result.outcome) {
            case 'decided':
                await editMessageText(chatId, messageId, decidedNotice(result.name, result.action, reviewedBy));
                return;
            case 'already-decided':
                await editMessageText(chatId, messageId, alreadyDecidedNotice(result.name, result.status));
                return;
            case 'not-found':
            case 'failed':
                await editMessageText(chatId, messageId, decisionFailedNotice());
                return;
        }
    });

    return NextResponse.json({ ok: true });
}

// POST from Telegram
//   → verify secret header          (is this Telegram?)
//   → verify chat id + user id      (is this you?)
//   → parse "a:412" → approve, 412
//   → answerCallbackQuery           ← stops the spinner, immediately
//   → return 200 to Telegram        ← Telegram is done waiting
//   ┊
//   └─ after(): decideSubmission → editMessageText