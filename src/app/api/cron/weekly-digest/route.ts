import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateWeeklyDigest } from '@/lib/ai/generate-digest';
import { sendDigestEmail } from '@/lib/utils/notifications';
import { isAuthorizedCron } from '@/lib/auth/cron-auth';

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // Fetch this week's items
    const { data: items } = await supabase
      .from('intel_items')
      .select('*')
      .gte('ingested_at', weekAgo)
      .not('ai_analysis', 'is', null)
      .order('relevance_score', { ascending: false })
      .limit(100);

    if (!items || items.length === 0) {
      return NextResponse.json({ ok: true, message: 'No items to digest' });
    }

    // Generate digest
    const content = await generateWeeklyDigest(items);

    // Store digest
    await supabase.from('weekly_digests').insert({
      week_start: weekAgo,
      week_end: now,
      content,
      item_count: items.length,
      generated_at: now,
    });

    // Send email to all active users
    const { data: users } = await supabase
      .from('user_profiles')
      .select('email')
      .not('email', 'is', null);

    if (users && users.length > 0) {
      const emails = users.map((u) => u.email);
      await sendDigestEmail(
        emails,
        `FCG Weekly Intelligence Digest — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        `<div style="font-family: sans-serif; max-width: 700px; margin: 0 auto;">
          <div style="background: #1a3a2a; padding: 24px; color: #f4f1ea;">
            <h1 style="margin: 0; font-size: 20px;">FCG Weekly Intelligence Digest</h1>
            <p style="margin: 8px 0 0; opacity: 0.7; font-size: 14px;">${items.length} items analyzed this week</p>
          </div>
          <div style="padding: 24px; border: 1px solid #e5e7eb; white-space: pre-wrap; line-height: 1.7; font-size: 15px;">
            ${content.replace(/\n/g, '<br>')}
          </div>
          <div style="padding: 16px 24px; background: #f9fafb; font-size: 12px; color: #6b7280;">
            <a href="https://fcgok.com/portal" style="color: #1a3a2a;">View full portal</a> &middot;
            Frontier Consulting Group
          </div>
        </div>`,
      );
    }

    return NextResponse.json({ ok: true, itemCount: items.length });
  } catch (error) {
    console.error('Weekly digest failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
