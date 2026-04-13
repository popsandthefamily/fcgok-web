import { Resend } from 'resend';

interface SendInviteEmailArgs {
  to: string;
  orgName: string;
  role: string;
  acceptUrl: string;
  expiresAt: Date;
}

function renderInviteHtml({ orgName, role, acceptUrl, expiresAt }: SendInviteEmailArgs): string {
  const expiresText = expiresAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Frontier Intelligence Invitation</title>
  </head>
  <body style="margin:0;padding:0;background:#0f1f17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;color:#f4f1ea;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0f1f17;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;">
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;letter-spacing:0.04em;color:#dbb532;">
                  FRONTIER
                </div>
                <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(244,241,234,0.55);margin-top:4px;">
                  Consulting Group
                </div>
              </td>
            </tr>

            <tr>
              <td style="background:#f8f5ef;border-radius:10px;padding:40px 40px 36px;color:#1a1a1a;">
                <h1 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;color:#0f1f17;">
                  You&rsquo;re invited to Frontier&nbsp;Intelligence
                </h1>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#4b5563;">
                  An administrator at Frontier Consulting Group has provisioned a new intelligence
                  instance for <strong style="color:#111827;">${escapeHtml(orgName)}</strong>. You&rsquo;ve been
                  invited as <strong style="color:#111827;">${escapeHtml(role)}</strong>. Click below to accept,
                  sign in, and walk through the 5-step setup wizard.
                </p>

                <div style="margin:28px 0;">
                  <a href="${escapeHtml(acceptUrl)}"
                    style="display:inline-block;background:#0f1f17;color:#f4f1ea;font-size:14px;font-weight:500;letter-spacing:0.03em;text-decoration:none;padding:13px 28px;border-radius:4px;">
                    Accept invitation &rarr;
                  </a>
                </div>

                <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">
                  Or paste this link into your browser:
                </p>
                <p style="margin:0 0 22px;font-size:11px;color:#4b5563;word-break:break-all;font-family:'SF Mono',Menlo,Consolas,monospace;">
                  ${escapeHtml(acceptUrl)}
                </p>

                <div style="border-top:1px solid #e5e0d4;padding-top:18px;margin-top:10px;">
                  <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                    This invitation expires on <strong>${expiresText}</strong> and can only be redeemed
                    once. If you weren&rsquo;t expecting this, you can safely ignore this email.
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-top:28px;">
                <p style="margin:0;font-size:11px;color:rgba(244,241,234,0.45);line-height:1.6;">
                  Frontier Consulting Group &middot;
                  <a href="mailto:info@fcgok.com" style="color:rgba(244,241,234,0.7);text-decoration:none;">info@fcgok.com</a>
                </p>
                <p style="margin:6px 0 0;font-size:11px;color:rgba(244,241,234,0.35);">
                  This portal is for authorized FCG retainer clients only.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendInviteEmail(args: SendInviteEmailArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? 'Frontier Consulting Group <info@fcgok.com>';
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: 'You\u2019re invited to Frontier Intelligence',
    html: renderInviteHtml(args),
    text: `You've been invited to Frontier Intelligence as ${args.role} for ${args.orgName}. Accept your invitation: ${args.acceptUrl}\n\nThis link expires on ${args.expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`,
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message ?? 'unknown error'}`);
  }
}
