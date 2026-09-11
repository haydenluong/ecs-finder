// scripts/seed.ts
// One-off: push the hardcoded activities into Supabase. Safe to re-run.
import { createClient } from '@supabase/supabase-js';
import { mockActivities } from '../src/data/Activities';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — check .env');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const rows = mockActivities.map(a => ({ ...a, status: 'approved' as const }));

const { data, error } = await supabase
  .from('activities_submissions')
  .upsert(rows, { onConflict: 'id' })
  .select('id');

if (error) {
  console.error('Seed failed:', error.message);
  process.exit(1);
}

// Seeding inserts explicit ids, which does NOT advance the id sequence.
// Realign it so later inserts (e.g. the /api/submit form) don't collide.
// Requires the reset_activities_submissions_id_seq() function in the DB.
const { error: seqError } = await supabase.rpc('reset_activities_submissions_id_seq');

if (seqError) {
  console.error('Seeded rows, but failed to realign the id sequence:', seqError.message);
  console.error('Create the reset_activities_submissions_id_seq() function (see CLAUDE.md), then re-run.');
  process.exit(1);
}

console.log(`Seeded ${data.length} rows into activities_submissions and realigned the id sequence.`);
