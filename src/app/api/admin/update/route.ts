import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';
import { pickPatch, updateSubmission } from '@/lib/updateSubmission';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const session = await verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value);
    if (!session) {
        return NextResponse.json({ ok: false, message: 'Chưa đăng nhập.' }, { status: 401 });
    }

    let body: { id?: unknown; patch?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, message: 'Yêu cầu không hợp lệ.' }, { status: 400 });
    }

    const id = body.id;
    if (typeof id !== 'number' || !Number.isInteger(id)) {
        return NextResponse.json({ ok: false, message: 'ID không hợp lệ.' }, { status: 400 });
    }

    const result = await updateSubmission(id, pickPatch(body.patch), {
        editableStatuses: ['pending', 'approved'],
    });

    switch (result.outcome) {
        case 'updated':
            return NextResponse.json({ ok: true });
        case 'invalid':
            return NextResponse.json(
                { ok: false, field: result.field, code: result.code },
                { status: 400 },
            );
        case 'not-editable':
            return NextResponse.json(
                { ok: false, message: 'Hoạt động này đã bị từ chối, không sửa được nữa.' },
                { status: 409 },
            );
        case 'not-found':
            return NextResponse.json({ ok: false, message: 'Không tìm thấy hoạt động.' }, { status: 404 });
        case 'failed':
            return NextResponse.json({ ok: false, message: 'Không thể lưu, vui lòng thử lại.' }, { status: 500 });
    }
}
