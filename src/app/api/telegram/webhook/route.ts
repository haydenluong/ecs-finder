import { NextResponse, after } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from '@/../utils/supabase/admin';
import { decideSubmission, type DecisionAction } from '@/lib/decideSubmission';
import { answerCallbackQuery, editMessageText } from '@/lib/telegram';
import {
    newSubmissionNotice,
    confirmRejectNotice,
    decidedNotice,
    alreadyDecidedNotice,
    decisionFailedNotice,
    type SubmissionForNotice,
} from '@/lib/submissionTelegram';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CALLBACK = /^(a|r\?|r!|x):(\d{1,15})$/;

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

async function loadNotice(id: number): Promise<SubmissionForNotice | null> {
    const { data, error } = await getSupabaseAdmin()
        .from('activities_submissions')
        .select('id, name, category, topic, subtopic, location, deadline, desc, link, email, positions, image, link_check_passed, content_check_verdict, content_check_reason')
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
        linkCheckPassed: data.link_check_passed === true,
        contentCheckVerdict: data.content_check_verdict,
        contentCheckReason: data.content_check_reason,
    };
}

export async function POST(request: Request) {
    if (!isAuthorised(request)) {
        return new NextResponse(null, { status: 401 });
    }

    const allowedChat = process.env.TELEGRAM_CHAT_ID;
    if (!allowedChat) {
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

    if (String(cq.message?.chat?.id) !== allowedChat || String(cq.from?.id) !== allowedChat) {
        console.error('Telegram callback from an unexpected chat or user');
        return new NextResponse(null, { status: 401 });
    }

    const match = CALLBACK.exec(cq.data ?? '');
    if (!match) {
        await answerCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
    }

    const [, prefix, rawId] = match;
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
    await answerCallbackQuery(cq.id, pending[prefix] || undefined);

    after(async () => {
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
