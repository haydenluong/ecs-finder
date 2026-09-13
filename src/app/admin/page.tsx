import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/../utils/supabase/admin';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';
import AdminClient from './AdminClient';
import type { Activity, ReviewStatus } from '@/types';

// A moderation queue must never be cached: an approved row has to leave the list
// on the next load, and static rendering would bake one view into the build.
export const dynamic = 'force-dynamic';

const REVIEW_STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected'];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // middleware.ts already gated this, but the page needs the session for the
  // reviewer's name anyway, so verifying here keeps it correct on its own.
  const session = await verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!session) redirect('/admin/login');

  const requested = (await searchParams).status;
  const status: ReviewStatus =
    REVIEW_STATUSES.find(s => s === requested) ?? 'pending';

  // Service-role client, NOT createClient()/createPublicClient(): the RLS policy
  // is `using (status = 'approved')`, so the anon key returns zero pending rows
  // with no error at all — an empty queue and nothing in the logs.
  const { data, error } = await getSupabaseAdmin()
    .from('activities_submissions')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) console.error('Failed to load submissions for review:', error.message);

  return (
    <AdminClient
      reviewer={session.sub}
      status={status}
      activities={(data ?? []) as Activity[]}
      loadFailed={Boolean(error)}
    />
  );
}
