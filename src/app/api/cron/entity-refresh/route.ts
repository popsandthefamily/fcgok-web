import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();

    // Update activity counts and last_activity_at for all entities
    const { data: entities } = await supabase
      .from('tracked_entities')
      .select('id, name');

    if (!entities) return NextResponse.json({ ok: true, updated: 0 });

    let updated = 0;

    for (const entity of entities) {
      const { count } = await supabase
        .from('entity_intel_links')
        .select('*', { count: 'exact', head: true })
        .eq('entity_id', entity.id);

      const { data: latestLink } = await supabase
        .from('entity_intel_links')
        .select('intel_item_id, intel_items(published_at)')
        .eq('entity_id', entity.id)
        .order('intel_item_id', { ascending: false })
        .limit(1);

      const lastActivity = (latestLink?.[0] as { intel_items?: { published_at?: string } })
        ?.intel_items?.published_at ?? null;

      await supabase
        .from('tracked_entities')
        .update({
          activity_count: count ?? 0,
          last_activity_at: lastActivity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entity.id);

      updated++;
    }

    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    console.error('Entity refresh failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
