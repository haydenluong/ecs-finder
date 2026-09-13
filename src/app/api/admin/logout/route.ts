import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, sessionCookieOptions } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST() {
    const response = NextResponse.json({ ok: true });
    // Same attributes as when set (bar maxAge): a cookie cleared with a
    // mismatched path is a different cookie, and the browser keeps the original.
    response.cookies.set(ADMIN_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 });
    return response;
}
