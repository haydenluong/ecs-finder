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

console.log(`Seeded ${data.length} rows into activities_submissions.`);
