// Tracking-aware outreach email sender.
//
// Renders a plain-text body to HTML with:
//   - URL detection → anchors with href rewritten through
//     /api/track/click/{send_id}?to={url}
//   - Invisible 1x1 tracking pixel at the bottom that hits
//     /api/track/open/{send_id}
//
// Both endpoints log engagement_events keyed to the outreach_sends row
// (which already carries pipeline_id from Phase 2 ship 3). The trigger
// from migration 007 takes care of rollups + timeline mirroring.

import { Resend } from 'resend';

interface SendOutreachArgs {
  to: string;
  subject: string;
  bodyText: string;
  sendId: string;
  origin: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Convert plain-text body to HTML with URL detection + tracking
// rewrites + tracking pixel. Tolerant of plain-text input (nothing
// in the body should be raw HTML) — we escape every non-URL segment.
export function renderOutreachHtml(bodyText: string, sendId: string, origin: string): string {
  const urlRegex = /(https?:\/\/[^\s<>"]+)/g;
  const segments: string[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = urlRegex.exec(bodyText))) {
    if (m.index > lastIndex) {
      segments.push(escapeHtml(bodyText.slice(lastIndex, m.index)).replace(/\n/g, '<br>'));
    }
    const trackedUrl = `${origin}/api/track/click/${sendId}?to=${encodeURIComponent(m[0])}`;
    segments.push(
      `<a href="${escapeHtml(trackedUrl)}" target="_blank" rel="noopener">${escapeHtml(m[0])}</a>`,
    );
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < bodyText.length) {
    segments.push(escapeHtml(bodyText.slice(lastIndex)).replace(/\n/g, '<br>'));
  }

  const body = segments.join('');
  const pixel = `<img src="${origin}/api/track/open/${sendId}" width="1" height="1" alt="" style="display:block;border:0;outline:none;text-decoration:none;">`;

  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#111827;background:#ffffff;">${body}${pixel}</body></html>`;
}

export async function sendOutreachEmail(args: SendOutreachArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? 'Frontier Consulting Group <info@fcgok.com>';
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');

  const resend = new Resend(apiKey);
  const html = renderOutreachHtml(args.bodyText, args.sendId, args.origin);

  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html,
    text: args.bodyText,
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message ?? 'unknown error'}`);
  }
}
