import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';
import { decideSubmission, isDecisionAction } from '@/lib/decideSubmission';

export const runtime = 'nodejs';

export async function POST(request: Request) {
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
    if (!isDecisionAction(action)) {
        return NextResponse.json({ ok: false, message: 'Hành động không hợp lệ.' }, { status: 400 });
    }

    const result = await decideSubmission(id, action, session.sub);

    switch (result.outcome) {
        case 'decided':
            return NextResponse.json({ ok: true });
        case 'not-found':
        case 'already-decided':
            return NextResponse.json({ ok: false, message: 'Không tìm thấy hoạt động.' }, { status: 404 });
        case 'failed':
            return NextResponse.json({ ok: false, message: 'Không thể cập nhật, vui lòng thử lại.' }, { status: 500 });
    }
}
