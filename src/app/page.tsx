import { createPublicClient } from '@/../utils/supabase/server';
import HomeClient from './HomeClient';
import type { Activity } from '@/types';

export const revalidate = 60;

export default async function Home() {
  const supabase = createPublicClient();

  // Not '*': RLS filters rows, not columns, and `email` must never reach the browser.
  const {data, error} = await supabase
  .from('activities_submissions')
  .select('id, created_at, name, category, topic, subtopic, location, deadline, positions, "desc", desc_en, image, image_position, link, status')
  .eq('status', 'approved')
  
  if (error) console.error('Failed to load activities:', error.message)

  return <HomeClient activities={(data ?? []) as Activity[]} />;
}
