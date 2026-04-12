'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Template {
  id: string;
  category: string;
  title: string;
  subject: string;
  body: string;
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'cold-lp',
    category: 'Cold Outreach (LP)',
    title: 'Initial LP Introduction',
    subject: 'Self-Storage Opportunity in {{market}} - 720 Companies',
    body: `Hi {{first_name}},

I came across {{company_name}} and your focus on {{investment_focus}}. 720 Companies is actively pursuing self-storage acquisitions in {{market}}, and I believe there may be alignment with your allocation strategy.

We are targeting {{deal_size}} deals with {{return_profile}} returns, backed by strong demographic tailwinds and operational upside.

Would you be open to a brief call this week to explore potential fit?

Best regards,
{{sender_name}}
720 Companies`,
  },
  {
    id: 'follow-up',
    category: 'Follow-Up',
    title: 'Post-Meeting Follow-Up',
    subject: 'Following Up - {{deal_name}} Discussion',
    body: `Hi {{first_name}},

Thank you for taking the time to speak with me on {{meeting_date}}. I appreciated learning more about {{company_name}}'s approach to {{investment_focus}}.

As discussed, I have attached {{attachment_description}} for your review. Key highlights:

- {{highlight_1}}
- {{highlight_2}}
- {{highlight_3}}

Please let me know if you have any questions or would like to schedule a follow-up conversation.

Best regards,
{{sender_name}}
720 Companies`,
  },
  {
    id: 'intro-request',
    category: 'Introduction Request',
    title: 'Warm Introduction Request',
    subject: 'Introduction Request - {{target_name}} at {{target_company}}',
    body: `Hi {{connector_name}},

I hope this message finds you well. I am reaching out because I noticed your connection to {{target_name}} at {{target_company}}.

720 Companies is expanding its self-storage portfolio in {{market}} and I believe {{target_company}} could be a strong capital partner given their focus on {{target_focus}}.

Would you be comfortable making a brief introduction? I am happy to draft a forwardable blurb if that makes it easier.

Thank you in advance,
{{sender_name}}
720 Companies`,
  },
  {
    id: 'deal-update',
    category: 'Deal Update',
    title: 'Investor Deal Update',
    subject: 'Deal Update: {{deal_name}} - {{month}} {{year}}',
    body: `Hi {{first_name}},

Here is your monthly update on {{deal_name}}:

Status: {{deal_status}}
Occupancy: {{occupancy_rate}}
NOI (trailing): {{trailing_noi}}
CapEx Progress: {{capex_status}}

Key developments this period:
- {{update_1}}
- {{update_2}}

Next steps:
- {{next_step_1}}
- {{next_step_2}}

Full financials are available in the investor portal. Please reach out with any questions.

Best regards,
{{sender_name}}
720 Companies`,
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function updateBody(id: string, newBody: string) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, body: newBody } : t)),
    );
  }

  function updateSubject(id: string, newSubject: string) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, subject: newSubject } : t)),
    );
  }

  async function copyToClipboard(template: Template) {
    const text = `Subject: ${template.subject}\n\n${template.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: select text
    }
  }

  return (
    <>
      <div className="portal-header">
        <h1>Outreach Templates</h1>
        <Link href="/portal/toolkit" className="portal-btn portal-btn-ghost">
          &larr; Toolkit
        </Link>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Edit any template below to customize it, then copy to clipboard. Placeholders
        use <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>{'{{field_name}}'}</code> format.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {templates.map((template) => (
          <div key={template.id} className="portal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span
                  className="badge badge-category"
                  style={{ marginBottom: 6, display: 'inline-block' }}
                >
                  {template.category}
                </span>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
                  {template.title}
                </div>
              </div>
              <button
                className="portal-btn portal-btn-primary"
                onClick={() => copyToClipboard(template)}
                style={{ whiteSpace: 'nowrap' }}
              >
                {copiedId === template.id ? 'Copied' : 'Copy to Clipboard'}
              </button>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
                Subject Line
              </label>
              <input
                type="text"
                className="filter-search"
                value={template.subject}
                onChange={(e) => updateSubject(template.id, e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
                Body
              </label>
              <textarea
                value={template.body}
                onChange={(e) => updateBody(template.id, e.target.value)}
                style={{
                  width: '100%',
                  minHeight: 200,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 4,
                  fontSize: 13,
                  lineHeight: 1.65,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  color: '#374151',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
