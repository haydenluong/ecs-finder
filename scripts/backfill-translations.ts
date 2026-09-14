// scripts/backfill-translations.ts
// One-off: translate desc -> desc_en for approved rows that predate the column.
// Safe to re-run; rows that already have a translation are skipped.
import { createClient } from '@supabase/supabase-js';
import { translateDesc } from '../src/lib/translateDesc';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — check .env');
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY — check .env');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const { data: rows, error } = await supabase
  .from('activities_submissions')
  .select('id, name, desc')
  .eq('status', 'approved')
  .is('desc_en', null);

if (error) {
  console.error('Backfill failed to read rows:', error.message);
  process.exit(1);
}

if (rows.length === 0) {
  console.log('Nothing to backfill — every approved row already has desc_en.');
  process.exit(0);
}

console.log(`Translating ${rows.length} approved row(s)...`);

let translated = 0;
const failed: number[] = [];

// Sequential on purpose: this runs against the live table, and a burst of
// parallel requests risks Anthropic rate limits for no useful speedup.
for (const row of rows) {
  const descEn = await translateDesc(row.desc);

  if (!descEn) {
    failed.push(row.id);
    console.error(`  ${row.id} — translation failed, left null: ${row.name}`);
    continue;
  }

  const { error: updateError } = await supabase
    .from('activities_submissions')
    .update({ desc_en: descEn })
    .eq('id', row.id);

  if (updateError) {
    failed.push(row.id);
    console.error(`  ${row.id} — write failed: ${updateError.message}`);
    continue;
  }

  translated++;
  console.log(`  ${row.id} — ok: ${row.name}`);
}

console.log(`Backfilled ${translated} of ${rows.length} row(s).`);

if (failed.length > 0) {
  console.error(`Left untranslated (will fall back to Vietnamese): ${failed.join(', ')}`);
  console.error('Re-run to retry only these rows.');
  process.exit(1);
}
