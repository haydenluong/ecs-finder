import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/../utils/supabase/admin';
import {
    ADMIN_COOKIE,
    createSessionToken,
    findApproverByPassword,
    isAdminAuthConfigured,
    sessionCookieOptions,
} from '@/lib/adminAuth';

export const runtime = 'nodejs';

// Generous enough that mistyping a password a few times won't lock you out, low
// enough that online brute force is hopeless.
const MAX_ATTEMPTS = 10;
const WINDOW_SECONDS = 15 * 60;

export async function POST(request: Request) {
    // Without this, a deploy missing SESSION_SECRET or ADMIN_USERS rejects every
    // correct password as wrong, which is near-impossible to debug.
    if (!isAdminAuthConfigured()) {
        console.error('Admin login attempted but SESSION_SECRET / ADMIN_USERS are not configured.');
        return NextResponse.json(
            { ok: false, message: 'Đăng nhập chưa được cấu hình trên máy chủ.' },
            { status: 500 },
        );
    }

    let password: unknown;
    try {
        password = (await request.json())?.password;
    } catch {
        return NextResponse.json({ ok: false, message: 'Yêu cầu không hợp lệ.' }, { status: 400 });
    }

    if (typeof password !== 'string' || password === '') {
        return NextResponse.json({ ok: false, message: 'Vui lòng nhập mật khẩu.' }, { status: 400 });
    }

    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';

    // The 'admin-login:' prefix keeps these attempts in their own bucket so they
    // don't consume an IP's activity-submission allowance, or vice versa.
    const { data: withinLimit, error: rateLimitError } = await getSupabaseAdmin().rpc('check_rate_limit', {
        p_ip: `admin-login:${ip}`,
        p_max_requests: MAX_ATTEMPTS,
        p_window_seconds: WINDOW_SECONDS,
    });

    // Fails closed, unlike /api/submit: there a broken limiter just lets a
    // submission through, here it removes the only brake on password guessing.
    if (rateLimitError) {
        console.error('check_rate_limit failed on admin login, rejecting:', rateLimitError);
        return NextResponse.json({ ok: false, message: 'Không thể đăng nhập, vui lòng thử lại sau.' }, { status: 503 });
    }
    if (!withinLimit) {
        return NextResponse.json(
            { ok: false, message: 'Bạn đã thử quá nhiều lần. Vui lòng đợi 15 phút.' },
            { status: 429 },
        );
    }

    const label = await findApproverByPassword(password);
    if (!label) {
        return NextResponse.json({ ok: false, message: 'Mật khẩu không đúng.' }, { status: 401 });
    }

    const token = await createSessionToken(label);
    if (!token) {
        return NextResponse.json({ ok: false, message: 'Không thể tạo phiên đăng nhập.' }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, token, sessionCookieOptions());
    return response;
}
