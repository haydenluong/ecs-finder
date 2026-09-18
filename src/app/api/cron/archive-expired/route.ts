// Nightly tidy-up: expired activities leave the public list and give back the
// storage their photo was holding.
//
// The site does NOT depend on this having run — src/app/page.tsx filters on the
// deadline at read time, so a missed run costs disk, not correctness.

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from '@/../utils/supabase/admin';
import { todayInVietnam } from '@/data/Activities';
import { deleteActivityImages } from '@/lib/activityImages';

export const runtime = 'nodejs';

/**
 * middleware.ts only matches /admin and /api/admin, so this route is public and
 * has to gate itself. Vercel Cron sends this header automatically once
 * CRON_SECRET is set; a missing secret fails closed rather than open.
 */
function isAuthorised(request: Request): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret || secret.length < 16) return false;

    const expected = Buffer.from(`Bearer ${secret}`);
    const given = Buffer.from(request.headers.get('authorization') ?? '');
    return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function GET(request: Request) {
    if (!isAuthorised(request)) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Rate-limit rows are only meaningful inside their one-hour window, and the
    // privacy policy says so. Failing here must not stop the archive work below.
    const { data: purged, error: purgeError } = await supabaseAdmin
        .rpc('purge_rate_limits', { p_older_than_seconds: 86400 });

    if (purgeError) {
        console.error('Rate-limit purge failed, continuing with archive:', purgeError);
    }

    const { data: expired, error: readError } = await supabaseAdmin
        .from('activities_submissions')
        .select('id, image')
        .eq('status', 'approved')
        .lt('deadline', todayInVietnam());

    if (readError) {
        console.error('Archive job read failed:', readError);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
    if (expired.length === 0) {
        return NextResponse.json({ ok: true, archived: 0, imagesDeleted: 0, rateLimitRowsPurged: purged ?? 0 });
    }

    const ids = expired.map(row => row.id);

    // Archive first, delete photos second. If this run dies in between, the rows
    // are still right and a few images linger — the next run cannot re-find them,
    // but an orphaned file is a far cheaper failure than a live activity whose
    // photo has already been deleted.
    const { error: updateError } = await supabaseAdmin
        .from('activities_submissions')
        .update({ status: 'archived' })
        .in('id', ids);

    if (updateError) {
        console.error('Archive job update failed:', updateError);
        return NextResponse.json({ ok: false }, { status: 500 });
    }

    const imagesDeleted = await deleteActivityImages(expired.map(row => row.image));

    return NextResponse.json({ ok: true, archived: ids.length, imagesDeleted, rateLimitRowsPurged: purged ?? 0 });
}
