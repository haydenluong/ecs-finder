import { cookies } from 'next/headers';
import { createClient } from '@/../utils/supabase/server';
import HomeClient from './HomeClient';
import type { Activity } from '@/types';

export default async function Home() {
  const supabase = createClient(await cookies());

  const {data, error} = await supabase 
  .from('activities_submissions')
  .select('*')
  .eq('status', 'approved')
  
  if (error) console.error('Failed to load activities:', error.message)

  return <HomeClient activities={(data ?? []) as Activity[]} />;
}
