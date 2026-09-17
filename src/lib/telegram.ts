import 'server-only';

const API = 'https://api.telegram.org';

export interface InlineButton {
    text: string;
    callback_data: string;
}

export interface InlineKeyboard {
    inline_keyboard: InlineButton[][];
}

export function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function call(method: string, payload: Record<string, unknown>): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error('Telegram not configured: TELEGRAM_BOT_TOKEN is required');
        return false;
    }

    try {
        const res = await fetch(`${API}/bot${token}/${method}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
            console.error(`Telegram ${method} failed:`, res.status, await res.text().catch(() => ''));
            return false;
        }
        return true;
    } catch (err) {
        console.error(`Telegram ${method} failed:`, err);
        return false;
    }
}

function linkPreview(previewImage?: string) {
    return previewImage
        ? { url: previewImage, prefer_large_media: true, show_above_text: true }
        : { is_disabled: true };
}

export async function sendMessage(
    text: string,
    replyMarkup?: InlineKeyboard,
    previewImage?: string,
): Promise<boolean> {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId) {
        console.error('Telegram not configured: TELEGRAM_CHAT_ID is required');
        return false;
    }

    return call('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        link_preview_options: linkPreview(previewImage),
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });
}

export async function editMessageText(
    chatId: number | string,
    messageId: number,
    text: string,
    replyMarkup?: InlineKeyboard,
    previewImage?: string,
): Promise<boolean> {
    return call('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        link_preview_options: linkPreview(previewImage),
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });
}

export async function answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert = false,
): Promise<boolean> {
    return call('answerCallbackQuery', {
        callback_query_id: callbackQueryId,
        ...(text ? { text, show_alert: showAlert } : {}),
    });
}
