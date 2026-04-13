import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import type { IntelItem } from '@/lib/types';

export const maxDuration = 30;

interface DigestBody {
  item_ids: string[];
  intro_note: string;
  subject: string;
  mode: 'preview' | 'send';
  recipients?: string[]; // optional override; defaults to all org users
}

interface OrgBranding {
  name?: string;
  logo_url?: string;
  brand_primary?: string;
  brand_secondary?: string;
  tagline?: string;
}

function renderDigestHTML(
  orgName: string,
  branding: OrgBranding,
  introNote: string,
  items: IntelItem[],
  senderName: string,
): string {
  const primary = branding.brand_primary ?? '#1a3a2a';
  const accent = branding.brand_secondary ?? '#dbb532';
  const logo = branding.logo_url
    ? `<img src="${branding.logo_url}" alt="${orgName}" style="height:40px;width:auto;filter:brightness(0) invert(1);margin-bottom:10px;" />`
    : '';
  const tagline = branding.tagline ?? 'Weekly intelligence from your market';

  const itemsHtml = items
    .map((item) => {
      const summary = item.summary ?? '';
      const src = (item.source ?? '').toUpperCase();
      return `
        <div style="padding:18px 24px;border-bottom:1px solid #e5e7eb;">
          <div style="font-size:10px;color:${accent};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;font-weight:600;">${src}</div>
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:17px;color:${primary};margin-bottom:6px;line-height:1.3;">${escapeHtml(item.title)}</div>
          ${summary ? `<div style="font-size:13px;color:#374151;line-height:1.6;margin-bottom:8px;">${escapeHtml(summary)}</div>` : ''}
          ${item.source_url ? `<a href="${item.source_url}" style="font-size:12px;color:${primary};text-decoration:none;">Read original →</a>` : ''}
        </div>`;
    })
    .join('');

  const intro = introNote.trim()
    ? `<div style="padding:24px;background:#fefbf0;border-left:3px solid ${accent};margin:0 24px 24px;">
         <div style="font-size:11px;color:${primary};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;font-weight:600;">Note from ${escapeHtml(senderName)}</div>
         <div style="font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${escapeHtml(introNote)}</div>
       </div>`
    : '';

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;background:white;">
      <div style="background:${primary};padding:28px 24px;color:white;">
        ${logo}
        <div style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${accent};font-weight:600;">Weekly Intelligence</div>
        <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;margin:6px 0 4px;font-weight:400;">${escapeHtml(orgName)}</h1>
        <div style="font-size:12px;opacity:0.8;">${escapeHtml(tagline)}</div>
      </div>
      ${intro}
      <div style="padding:0;">${itemsHtml}</div>
      <div style="padding:20px 24px;background:#f9fafb;border-top:2px solid ${primary};font-size:11px;color:#6b7280;text-align:center;">
        ${escapeHtml(orgName)} · Frontier Intelligence<br />
        Strictly confidential. Not an offer to sell securities.
      </div>
    </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request: Request) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const body = (await request.json()) as DigestBody;
  if (!body.item_ids || body.item_ids.length === 0) {
    return NextResponse.json({ error: 'Select at least one item' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Fetch org branding
  const { data: org } = await supabase
    .from('organizations')
    .select('name, settings')
    .eq('id', auth.orgId!)
    .single();

  const orgName = org?.name ?? 'Frontier Intelligence';
  const branding = (org?.settings?.brand as OrgBranding | undefined) ?? {};

  // Fetch selected items in the requested order
  const { data: items } = await supabase
    .from('intel_items')
    .select('*')
    .in('id', body.item_ids);

  // Preserve the order from item_ids
  const orderMap = new Map(body.item_ids.map((id, i) => [id, i]));
  const orderedItems = (items ?? []).sort(
    (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
  ) as IntelItem[];

  // Fetch sender name
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', auth.id)
    .single();
  const senderName = (profile?.full_name as string | null) ?? 'Your analyst';

  const html = renderDigestHTML(orgName, branding, body.intro_note ?? '', orderedItems, senderName);

  if (body.mode === 'preview') {
    return NextResponse.json({ html, itemCount: orderedItems.length });
  }

  // Send mode
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email not configured (RESEND_API_KEY missing)' }, { status: 503 });
  }

  // Determine recipients
  let recipients = body.recipients ?? [];
  if (recipients.length === 0) {
    const { data: users } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('organization_id', auth.orgId!);
    recipients = (users ?? []).map((u) => u.email as string).filter(Boolean);
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients found for this organization' }, { status: 400 });
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.RESEND_FROM_EMAIL ?? `${orgName} <info@fcgok.com>`;

    const subject = body.subject ||
      `${orgName} Weekly Intelligence — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

    await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject,
      html,
    });

    // Record the digest in weekly_digests
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    await supabase.from('weekly_digests').insert({
      week_start: weekAgo.toISOString(),
      week_end: now.toISOString(),
      content: html,
      item_count: orderedItems.length,
      generated_at: now.toISOString(),
      sent_at: now.toISOString(),
    });

    return NextResponse.json({ ok: true, sent_to: recipients.length, subject });
  } catch (err) {
    console.error('Digest send failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Send failed' },
      { status: 500 },
    );
  }
}
