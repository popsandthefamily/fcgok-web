'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  title: string;
  category: string;
  subject: string;
  body: string;
}

export default function OutreachComposer({
  raiseId,
  pipelineId,
  defaultRecipientEmail,
  defaultRecipientName,
}: {
  raiseId: string;
  pipelineId: string;
  defaultRecipientEmail?: string | null;
  defaultRecipientName?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipientEmail ?? '');
  const [recipientName, setRecipientName] = useState(defaultRecipientName ?? '');
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || templates.length > 0) return;
    fetch('/api/templates')
      .then((r) => r.json())
      .then((d) => {
        const list = (d.templates ?? []) as Template[];
        setTemplates(list);
        if (list.length > 0 && !templateId) setTemplateId(list[0].id);
      })
      .catch(() => {});
  }, [open, templates.length, templateId]);

  function selectTemplate(id: string) {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (t) {
      // Prefill the editable fields with the raw template; user can either
      // edit by hand or click "Draft with AI" to fill placeholders.
      setSubject(t.subject);
      setBody(t.body);
    }
  }

  async function draftWithAI() {
    if (!templateId) {
      setError('Pick a template first');
      return;
    }
    setDrafting(true);
    setError(null);
    try {
      const res = await fetch(`/api/raises/${raiseId}/pipeline/${pipelineId}/draft-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setSubject(data.draft.subject);
      setBody(data.draft.body);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDrafting(false);
    }
  }

  async function copyBody() {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  async function markAsSent() {
    if (!templateId) {
      setError('Pick a template first');
      return;
    }
    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/raises/${raiseId}/pipeline/${pipelineId}/outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          subject,
          body,
          recipient_email: recipientEmail.trim() || null,
          recipient_name: recipientName.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      // Reset the form, keep the composer open for follow-ups
      setSubject('');
      setBody('');
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <div className="portal-card">
        <div className="portal-card-header">
          <span className="portal-card-title">Outreach</span>
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 0, marginBottom: '0.75rem', lineHeight: 1.5 }}>
          Draft a personalized email with AI, or compose from a template directly.
          Marking as sent logs it on the activity timeline.
        </p>
        <button onClick={() => setOpen(true)} className="portal-btn portal-btn-primary">
          + Compose outreach
        </button>
      </div>
    );
  }

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <span className="portal-card-title">Compose Outreach</span>
        <button onClick={() => setOpen(false)} className="portal-btn portal-btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>
          Close
        </button>
      </div>

      {error && (
        <div style={{ fontSize: 13, color: '#991b1b', background: '#fef2f2', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: 4, marginBottom: '0.75rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Field label="Template">
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={templateId}
              onChange={(e) => selectTemplate(e.target.value)}
              className="filter-search"
              style={{ flex: 1 }}
            >
              {templates.length === 0 && <option value="">Loading…</option>}
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} {t.category ? `· ${t.category}` : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={draftWithAI}
              disabled={drafting || !templateId}
              className="portal-btn portal-btn-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              {drafting ? 'Drafting…' : '✨ Draft with AI'}
            </button>
          </div>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Field label="Recipient Name">
            <input
              type="text"
              className="filter-search"
              style={{ width: '100%' }}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Recipient Email">
            <input
              type="email"
              className="filter-search"
              style={{ width: '100%' }}
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="jane@fund.com"
            />
          </Field>
        </div>

        <Field label="Subject">
          <input
            type="text"
            className="filter-search"
            style={{ width: '100%' }}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Pick a template or draft with AI to populate"
          />
        </Field>

        <Field label="Body">
          <textarea
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Pick a template or draft with AI to populate"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              fontFamily: 'inherit',
              fontSize: 13,
              resize: 'vertical',
              lineHeight: 1.5,
            }}
          />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={copyBody}
            className="portal-btn portal-btn-ghost"
            disabled={!subject && !body}
          >
            {copied ? 'Copied!' : 'Copy subject + body'}
          </button>
          <button
            type="button"
            onClick={markAsSent}
            disabled={sending || !subject.trim()}
            className="portal-btn portal-btn-primary"
          >
            {sending ? 'Logging…' : 'Mark as sent'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
          Tip: copy the body, send via your normal email client, then click Mark as sent
          to log it on the timeline.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
