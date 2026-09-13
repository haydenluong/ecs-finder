// Gate for /admin and /api/admin/*. The first of two checks, not the only one:
// /api/admin/decide re-verifies the session itself, since it holds the
// service-role key and the matcher below is one typo away from not covering it.
//
// Unrelated: utils/supabase/middleware.ts is dead code for Supabase Auth, which
// this design does not use. Nothing imports it.

import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';

export const config = {
    // `:path*` matches zero or more segments, so this covers bare /admin too.
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};

// Reachable without a session — otherwise there is no way to ever obtain one.
const PUBLIC_ADMIN_PATHS = new Set([
    '/admin/login',
    '/api/admin/login',
    '/api/admin/logout',
]);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();

    if (await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
        return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
        return NextResponse.json({ ok: false, message: 'Chưa đăng nhập.' }, { status: 401 });
    }

    return NextResponse.redirect(new URL('/admin/login', request.url));
}
