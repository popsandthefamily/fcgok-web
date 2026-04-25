import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sendId: string }> },
) {
  const { sendId } = await params;
  const url = new URL(request.url);
  const to = url.searchParams.get('to');

  if (!to || (!to.startsWith('http://') && !to.startsWith('https://'))) {
    return NextResponse.json({ error: 'Invalid destination' }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { data: send } = await supabase
    .from('outreach_sends')
    .select('id, pipeline_id, organization_id')
    .eq('id', sendId)
    .single();

  if (send?.pipeline_id && send?.organization_id) {
    const h = await headers();
    const xff = h.get('x-forwarded-for');
    const ip = xff ? xff.split(',')[0].trim() : h.get('x-real-ip');

    await supabase.from('engagement_events').insert({
      pipeline_id: send.pipeline_id,
      organization_id: send.organization_id,
      event_type: 'link_click',
      user_agent: h.get('user-agent'),
      referer: h.get('referer'),
      ip_inet: ip || null,
      payload: { send_id: sendId, destination: to },
    });
  }

  return NextResponse.redirect(to, { status: 302 });
}
