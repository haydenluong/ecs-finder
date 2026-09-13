import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/../utils/supabase/admin';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const ACTIONS = {
    approve: 'approved',
    reject: 'rejected',
} as const;

type Action = keyof typeof ACTIONS;

export async function POST(request: Request) {
    // Second check. middleware.ts already gated this path, but this route holds
    // the service-role key and must not depend on something outside itself for
    // authorisation — a one-character slip in the matcher would expose it.
    const session = await verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value);
    if (!session) {
        return NextResponse.json({ ok: false, message: 'Chưa đăng nhập.' }, { status: 401 });
    }

    let body: { id?: unknown; action?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, message: 'Yêu cầu không hợp lệ.' }, { status: 400 });
    }

    const id = body.id;
    const action = body.action;

    if (typeof id !== 'number' || !Number.isInteger(id)) {
        return NextResponse.json({ ok: false, message: 'ID không hợp lệ.' }, { status: 400 });
    }
    // Whitelist, not a passthrough: otherwise status could be set to any string.
    if (typeof action !== 'string' || !(action in ACTIONS)) {
        return NextResponse.json({ ok: false, message: 'Hành động không hợp lệ.' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
        .from('activities_submissions')
        .update({
            status: ACTIONS[action as Action],
            reviewed_by: session.sub,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('id');

    if (error) {
        console.error('Admin decision update failed:', error);
        return NextResponse.json({ ok: false, message: 'Không thể cập nhật, vui lòng thử lại.' }, { status: 500 });
    }

    // Postgres does not error on updating zero rows, so `.select()` above is what
    // turns a nonexistent id into a 404 instead of a misleading success.
    if (!data || data.length === 0) {
        return NextResponse.json({ ok: false, message: 'Không tìm thấy hoạt động.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
