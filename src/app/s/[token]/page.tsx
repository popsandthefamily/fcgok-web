import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import type { SharedAsset, EngagementEventType } from '@/lib/types/engagement';

export const dynamic = 'force-dynamic';

// Map asset type to the engagement event we log when the link is opened.
function eventTypeFor(asset: SharedAsset): EngagementEventType {
  switch (asset.asset_type) {
    case 'pitch_deck':
    case 'om':
    case 'market_snapshot':
    case 'comps':
      return 'document_view';
    case 'data_room':
      return 'data_room_login';
    case 'followup_link':
    case 'other':
    default:
      return 'link_click';
  }
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createServiceClient();

  const { data: asset } = await supabase
    .from('shared_assets')
    .select('*')
    .eq('token', token)
    .single();

  if (!asset) {
    return <PublicMessage title="Link not found" body="This share link doesn't exist or has been removed." />;
  }

  const a = asset as SharedAsset;

  if (a.revoked_at) {
    return <PublicMessage title="Link revoked" body="This share link has been revoked by the sender." />;
  }

  if (a.expires_at && new Date(a.expires_at).getTime() < Date.now()) {
    return <PublicMessage title="Link expired" body="This share link has expired." />;
  }

  // Log the engagement event. The trigger handles rollup + timeline mirror.
  // We capture user_agent and referer; Next doesn't expose IP cleanly, so
  // we read x-forwarded-for / x-real-ip from headers.
  const h = await headers();
  const userAgent = h.get('user-agent');
  const referer = h.get('referer');
  const xff = h.get('x-forwarded-for');
  const ip = xff ? xff.split(',')[0].trim() : h.get('x-real-ip');

  await supabase.from('engagement_events').insert({
    shared_asset_id: a.id,
    pipeline_id: a.pipeline_id,
    organization_id: a.organization_id,
    event_type: eventTypeFor(a),
    user_agent: userAgent,
    referer,
    ip_inet: ip || null,
  });

  // Resolve the destination. Ship 1 supports external_url only;
  // document_id and storage_path land in subsequent ships.
  const url = a.asset_ref?.external_url;
  if (url) {
    redirect(url);
  }

  return (
    <PublicMessage
      title="Share configured but no destination set"
      body="The sender created this link but hasn't configured a destination URL yet. Reply to their email to ask for the asset directly."
    />
  );
}

function PublicMessage({ title, body }: { title: string; body: string }) {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#fafafa',
    }}>
      <div style={{
        maxWidth: 480,
        background: 'white',
        borderRadius: 8,
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <h1 style={{ fontSize: 22, marginTop: 0, marginBottom: '0.75rem', color: '#111827' }}>{title}</h1>
        <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{body}</p>
      </div>
    </main>
  );
}
