# Supabase email templates

Branded HTML that replaces Supabase's default auth email bodies. Paste each file
into its matching template slot in the Supabase dashboard at:

  **Authentication → Email Templates**

These templates use only the merge tags Supabase guarantees:
`{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`, `{{ .Token }}`,
`{{ .TokenHash }}`, `{{ .RedirectTo }}`.

| File            | Template slot        | Suggested subject                              |
| --------------- | -------------------- | ---------------------------------------------- |
| `invite.html`   | Invite user          | You're invited to Frontier Intelligence        |

## Redirect URL allow-list

The invite flow redirects the user to `/portal/invite/callback?token=…` after
Supabase exchanges the magic link. Add this to the allow-list in:

  **Authentication → URL Configuration → Additional Redirect URLs**

```
http://localhost:3000/portal/invite/callback
https://<your-production-domain>/portal/invite/callback
```

Without these entries Supabase will refuse to redirect and the invitee will
see `redirect_to is not allowed`.

## Sender identity

Until custom SMTP (Resend / Postmark) is configured, the sender will still read
`noreply@mail.app.supabase.io`. To change the *visible* sender to
`info@fcgok.com`:

1. Add a custom SMTP provider in **Project Settings → Authentication → SMTP
   Settings**. Resend + a verified `fcgok.com` domain is the lowest-friction
   option.
2. Set the sender name to `Frontier Consulting Group` and sender email to
   `info@fcgok.com`.
3. Re-send a test invite from **/portal/admin/clients** to verify.

The HTML body in `invite.html` is safe to keep as-is whether you use the
Supabase-hosted SMTP or your own.
