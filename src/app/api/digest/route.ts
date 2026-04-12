import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from('weekly_digests')
    .select('*')
    .order('week_start', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ digests: data });
}
