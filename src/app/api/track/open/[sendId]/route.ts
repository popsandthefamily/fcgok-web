import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/server';

// 1x1 transparent GIF, base64-decoded once at module load.
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sendId: string }> },
) {
  const { sendId } = await params;
  const supabase = await createServiceClient();

  // Resolve the send → pipeline. If unknown sendId, still return the GIF
  // (don't leak existence) but skip event logging.
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
      event_type: 'email_open',
      user_agent: h.get('user-agent'),
      referer: h.get('referer'),
      ip_inet: ip || null,
      payload: { send_id: sendId },
    });
  }

  return new NextResponse(new Uint8Array(TRANSPARENT_GIF), {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': TRANSPARENT_GIF.length.toString(),
      // Force a fresh load on every email render so we capture re-opens.
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
    },
  });
}
