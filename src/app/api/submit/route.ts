import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { categorySet, topicSet, POSITIONS } from '@/data/tagData';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

// Checks the file's actual byte signature instead of trusting its claimed MIME type, which is spoofable.
async function detectImageType(file: File): Promise<string | null> {
    const bytes = Buffer.from(await file.slice(0, 12).arrayBuffer());
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
    if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
    return null;
}

export const runtime = 'nodejs';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
);

function fail(field: string, message: string) {
    return NextResponse.json({ ok: false, field, message }, { status: 400 });
}

// Verifies a Turnstile token server-to-server with Cloudflare. Never trust a
// token's presence alone — it must be checked against the secret key here.
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
    const body = new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
        remoteip: ip,
    });

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body,
    });

    if (!res.ok) {
        console.error('Turnstile siteverify request failed:', res.status, res.statusText);
        return false;
    }

    const result = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    if (!result.success) {
        console.error('Turnstile verification rejected:', result['error-codes']);
    }
    return result.success;
}

// Soft check: a failed fetch does not reject the submission (Facebook/Google
async function checkLinkLive(link: string): Promise<boolean> {
    try {
        const res = await fetch(link, {
            method: 'GET',
            redirect: 'follow',
            signal: AbortSignal.timeout(5000),
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ECSFinderBot/1.0)' },
        });
        return res.ok;
    } catch {
        return false;
    }
}

// normalize name to compare current submission with previous submissions to see if its the same one
function normalizeName(s: string): string {
    return s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/gi, 'd')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
}

export async function POST(request: Request) {
    const fd = await request.formData();
    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';

    const turnstileToken = (fd.get('cf_turnstile_response') as string) ?? '';
    if (!turnstileToken) {
        console.error('Turnstile check skipped: no token in submission');
        return fail('form', 'Xác minh không thành công, vui lòng thử lại.');
    }
    if (!(await verifyTurnstile(turnstileToken, ip))) {
        return fail('form', 'Xác minh không thành công, vui lòng thử lại.');
    }

    const name = (fd.get('name') as string ?? '').trim();
    const category = (fd.get('category') as string ?? '').trim();
    const topic = (fd.get('topic') as string ?? '').trim();
    const subtopic = (fd.get('subtopic') as string ?? '').trim();
    const location = (fd.get('location') as string ?? '').trim();
    const deadline = (fd.get('deadline') as string ?? '').trim();
    const desc = (fd.get('desc') as string ?? '').trim();
    const link = (fd.get('link') as string ?? '').trim();
    const image = fd.get('image');

    if (!name || !category || !topic || !location || !deadline || !desc || !link) {
        return fail('form', 'Vui lòng điền đầy đủ các trường bắt buộc.');
    }

    if (!(image instanceof File) || image.size === 0) {
        return fail('image', 'Vui lòng chọn một ảnh.');
    }

    let positions: unknown;
    try {
        positions = JSON.parse((fd.get('positions') as string) ?? '[]');
    } catch {
        return fail('positions', 'Dữ liệu vị trí không hợp lệ.');
    }
    if (!Array.isArray(positions) || !positions.every(p => typeof p === 'string' && POSITIONS.includes(p))) {
        return fail('positions', 'Vị trí không hợp lệ.');
    }

    if (!categorySet.some(c => c.label === category)) {
        return fail('category', 'Danh mục không hợp lệ.');
    }

    const matchedTopic = topicSet.find(t => t.name === topic);
    if (!matchedTopic) {
        return fail('topic', 'Chủ đề không hợp lệ.');
    }
    if (subtopic && !matchedTopic.subtopics.includes(subtopic)) {
        return fail('subtopic', 'Chủ đề con không hợp lệ.');
    }

    try {
        const url = new URL(link);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
    } catch {
        return fail('link', 'Liên kết đăng ký không hợp lệ.');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
        return fail('deadline', 'Ngày hạn nộp không hợp lệ.');
    }
// fail-open: still goes through with error
    const { data: withinLimit, error: rateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
        p_ip: ip,
        p_max_requests: 5,
        p_window_seconds: 3600,
    });

    if (rateLimitError) {
        console.error('check_rate_limit failed, allowing request through:', rateLimitError);
    } else if (!withinLimit) {
        return NextResponse.json(
            { ok: false, field: 'form', message: 'Bạn đã gửi quá nhiều hoạt động. Vui lòng thử lại sau.' },
            { status: 429 },
        );
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
        .from('activities_submissions')
        .select('name');

    if (fetchError) {
        return fail('form', 'Không thể kiểm tra trùng lặp, vui lòng thử lại.');
    }

    const normalizedName = normalizeName(name);
    const isDuplicate = existing.some(row => normalizeName(row.name) === normalizedName);
    if (isDuplicate) {
        return fail('name', 'Hoạt động này đã được gửi trước đó.');
    }

    const linkCheckPassed = await checkLinkLive(link);

    if (image.size > MAX_IMAGE_BYTES) {
        return fail('image', 'Ảnh không được vượt quá 5MB.');
    }

    const detectedType = await detectImageType(image);
    if (!detectedType) {
        return fail('image', 'Tệp không phải là ảnh hợp lệ (JPEG, PNG, WebP).');
    }

    const ext = MIME_TO_EXT[detectedType];
    const storagePath = `${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
        .from('activity-images')
        .upload(storagePath, image, {
            contentType: detectedType,
            upsert: false,
        });

    if (uploadError) {
        return fail('image', 'Không thể tải ảnh lên, vui lòng thử lại.');
    }

    const { data: publicUrlData } = supabaseAdmin.storage
        .from('activity-images')
        .getPublicUrl(storagePath);

    let imagePosition: unknown = null;
    try {
        const raw = fd.get('image_position') as string | null;
        if (raw) imagePosition = JSON.parse(raw);
    } catch {
        imagePosition = null;
    }
    if (
        !imagePosition || typeof imagePosition !== 'object' ||
        !['x', 'y', 'width', 'height', 'zoom'].every(k => {
            const v = (imagePosition as Record<string, unknown>)[k];
            return typeof v === 'number' && Number.isFinite(v);
        }) ||
        (imagePosition as Record<string, number>).width <= 0 ||
        (imagePosition as Record<string, number>).height <= 0 ||
        (['x', 'y', 'width', 'height'] as const).some(k => {
            const v = (imagePosition as Record<string, number>)[k];
            return v < 0 || v > 100;
        })
    ) {
        imagePosition = null;
    }

    const { error: insertError } = await supabaseAdmin
        .from('activities_submissions')
        .insert({
            name, category, topic,
            subtopic: subtopic || null,
            location, deadline, desc, link,
            positions,
            image: publicUrlData.publicUrl,
            image_position: imagePosition,
            link_check_passed: linkCheckPassed,
            status: 'pending',
        });

    if (insertError) {
        console.error('activities_submissions insert failed:', insertError);
        await supabaseAdmin.storage.from('activity-images').remove([storagePath]);
        return fail('form', 'Không thể lưu hoạt động, vui lòng thử lại.');
    }

    return NextResponse.json({ ok: true });
}
