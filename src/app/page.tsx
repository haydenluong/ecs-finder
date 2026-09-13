import { createPublicClient } from '@/../utils/supabase/server';
import HomeClient from './HomeClient';
import type { Activity } from '@/types';

export const revalidate = 60;

export default async function Home() {
  const supabase = createPublicClient();

  const {data, error} = await supabase 
  .from('activities_submissions')
  .select('*')
  .eq('status', 'approved')
  
  if (error) console.error('Failed to load activities:', error.message)

  return <HomeClient activities={(data ?? []) as Activity[]} />;
}
