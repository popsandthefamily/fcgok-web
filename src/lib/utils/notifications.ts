import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendDigestEmail(
  to: string[],
  subject: string,
  htmlBody: string,
) {
  return getResend().emails.send({
    from: 'FCG Portal <portal@fcgok.com>',
    to,
    subject,
    html: htmlBody,
  });
}

export async function sendHighPriorityAlert(
  to: string[],
  title: string,
  summary: string,
  sourceUrl: string | null,
) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <div style="background: #1a3a2a; padding: 20px; color: #f4f1ea;">
        <strong>FCG Capital Intelligence — High Priority</strong>
      </div>
      <div style="padding: 20px; border: 1px solid #e2e5ea;">
        <h2 style="margin: 0 0 12px; font-size: 18px;">${title}</h2>
        <p style="color: #3a4f42; line-height: 1.7;">${summary}</p>
        ${sourceUrl ? `<a href="${sourceUrl}" style="color: #1a3a2a; font-weight: 500;">View source &rarr;</a>` : ''}
      </div>
      <div style="padding: 12px 20px; font-size: 12px; color: #7a8f80;">
        Frontier Consulting Group &middot; fcgok.com/portal
      </div>
    </div>`;

  return getResend().emails.send({
    from: 'FCG Portal <portal@fcgok.com>',
    to,
    subject: `[HIGH PRIORITY] ${title}`,
    html,
  });
}
