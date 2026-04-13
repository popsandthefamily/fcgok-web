'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface Template {
  id: string;
  category: string;
  title: string;
  subject: string;
  body: string;
}

interface Send {
  id: string;
  recipient_email: string | null;
  recipient_name: string | null;
  subject_sent: string;
  sent_at: string;
  replied_at: string | null;
  reply_status: string | null;
  notes: string | null;
}

interface Stats {
  sent: number;
  replied: number;
}

const CATEGORIES = [
  'Cold Outreach (LP)',
  'Cold Outreach (Broker)',
  'Follow-Up',
  'Introduction Request',
  'Deal Update',
  'Thank You',
  'Other',
];

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

function extractPlaceholders(template: Template): string[] {
  const set = new Set<string>();
  const text = `${template.subject}\n${template.body}`;
  for (const match of text.matchAll(PLACEHOLDER_REGEX)) {
    set.add(match[1]);
  }
  return Array.from(set);
}

function fillPlaceholders(text: string, values: Record<string, string>): string {
  return text.replace(PLACEHOLDER_REGEX, (_, key: string) => {
    const v = values[key];
    return v && v.trim().length > 0 ? v : `{{${key}}}`;
  });
}

function humanizePlaceholder(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function gmailComposeUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, Record<string, string>>>({});
  const [expandedSendsId, setExpandedSendsId] = useState<string | null>(null);
  const [sendsByTemplate, setSendsByTemplate] = useState<Record<string, Send[]>>({});
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [logForm, setLogForm] = useState<{ recipient_email: string; recipient_name: string; notes: string }>({
    recipient_email: '',
    recipient_name: '',
    notes: '',
  });
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/templates');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to load templates (${res.status})`);
      }
      const { templates: t, stats: s } = await res.json();
      setTemplates(t ?? []);
      setStats(s ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateTemplate(id: string, patch: Partial<Template>) {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    setDirtyIds((prev) => new Set(prev).add(id));
  }

  function updatePlaceholder(templateId: string, field: string, value: string) {
    setPlaceholderValues((prev) => ({
      ...prev,
      [templateId]: { ...(prev[templateId] ?? {}), [field]: value },
    }));
  }

  async function saveTemplate(template: Template) {
    setSavingId(template.id);
    setError('');
    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: template.category,
          title: template.title,
          subject: template.subject,
          body: template.body,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save');
      }
      setDirtyIds((prev) => {
        const next = new Set(prev);
        next.delete(template.id);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSavingId(null);
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template? This cannot be undone.')) return;
    setDeletingId(id);
    setError('');
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to delete');
      }
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setDeletingId(null);
    }
  }

  async function createTemplate() {
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Other',
          title: 'New Template',
          subject: 'Subject line with {{placeholder}}',
          body: 'Hi {{first_name}},\n\n...\n\nBest,\n{{sender_name}}',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to create');
      }
      const { template } = await res.json();
      setTemplates((prev) => [...prev, template]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreating(false);
    }
  }

  async function copyToClipboard(template: Template) {
    const values = placeholderValues[template.id] ?? {};
    const subject = fillPlaceholders(template.subject, values);
    const body = fillPlaceholders(template.body, values);
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError('Failed to copy');
    }
  }

  function openInGmail(template: Template) {
    const values = placeholderValues[template.id] ?? {};
    const subject = fillPlaceholders(template.subject, values);
    const body = fillPlaceholders(template.body, values);
    const to = values['recipient_email'] ?? values['to'] ?? '';
    window.open(gmailComposeUrl(to, subject, body), '_blank', 'noopener,noreferrer');
  }

  async function toggleSendsExpanded(templateId: string) {
    if (expandedSendsId === templateId) {
      setExpandedSendsId(null);
      return;
    }
    setExpandedSendsId(templateId);
    if (!sendsByTemplate[templateId]) {
      try {
        const res = await fetch(`/api/templates/${templateId}/sends`);
        if (!res.ok) return;
        const { sends } = await res.json();
        setSendsByTemplate((prev) => ({ ...prev, [templateId]: sends ?? [] }));
      } catch {
        /* ignore */
      }
    }
  }

  async function logSend(template: Template) {
    const values = placeholderValues[template.id] ?? {};
    const subject_sent = fillPlaceholders(template.subject, values);
    const body_sent = fillPlaceholders(template.body, values);

    try {
      const res = await fetch(`/api/templates/${template.id}/sends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: logForm.recipient_email || null,
          recipient_name: logForm.recipient_name || null,
          subject_sent,
          body_sent,
          notes: logForm.notes || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to log send');
      }
      const { send } = await res.json();
      setSendsByTemplate((prev) => ({
        ...prev,
        [template.id]: [send, ...(prev[template.id] ?? [])],
      }));
      setStats((prev) => ({
        ...prev,
        [template.id]: {
          sent: (prev[template.id]?.sent ?? 0) + 1,
          replied: prev[template.id]?.replied ?? 0,
        },
      }));
      setLoggingId(null);
      setLogForm({ recipient_email: '', recipient_name: '', notes: '' });
      setExpandedSendsId(template.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function toggleReplied(templateId: string, send: Send) {
    const replied = !send.replied_at;
    try {
      const res = await fetch(`/api/templates/sends/${send.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replied }),
      });
      if (!res.ok) return;
      const { send: updated } = await res.json();
      setSendsByTemplate((prev) => ({
        ...prev,
        [templateId]: (prev[templateId] ?? []).map((s) => (s.id === send.id ? updated : s)),
      }));
      setStats((prev) => ({
        ...prev,
        [templateId]: {
          sent: prev[templateId]?.sent ?? 0,
          replied: (prev[templateId]?.replied ?? 0) + (replied ? 1 : -1),
        },
      }));
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading templates...</p>;
  }

  return (
    <>
      <div className="portal-header">
        <h1>Outreach Templates</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="portal-btn portal-btn-primary"
            onClick={createTemplate}
            disabled={creating}
          >
            {creating ? 'Creating...' : '+ New Template'}
          </button>
          <Link href="/portal/toolkit" className="portal-btn portal-btn-ghost">
            &larr; Toolkit
          </Link>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Templates save to your organization. Fill in the placeholder form on the right to preview,
        copy, open in Gmail, or log a send. Reply rates appear as you mark sends as replied.
      </p>

      {error && (
        <div
          className="portal-card"
          style={{ marginBottom: '1rem', borderColor: '#fca5a5', background: '#fef2f2' }}
        >
          <p style={{ margin: 0, fontSize: 13, color: '#991b1b' }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            stats={stats[template.id]}
            dirty={dirtyIds.has(template.id)}
            saving={savingId === template.id}
            deleting={deletingId === template.id}
            copied={copiedId === template.id}
            placeholderValues={placeholderValues[template.id] ?? {}}
            sendsExpanded={expandedSendsId === template.id}
            sends={sendsByTemplate[template.id] ?? []}
            logging={loggingId === template.id}
            logForm={logForm}
            onUpdate={(patch) => updateTemplate(template.id, patch)}
            onPlaceholderChange={(k, v) => updatePlaceholder(template.id, k, v)}
            onSave={() => saveTemplate(template)}
            onDelete={() => deleteTemplate(template.id)}
            onCopy={() => copyToClipboard(template)}
            onGmail={() => openInGmail(template)}
            onToggleSends={() => toggleSendsExpanded(template.id)}
            onStartLog={() => setLoggingId(template.id)}
            onCancelLog={() => {
              setLoggingId(null);
              setLogForm({ recipient_email: '', recipient_name: '', notes: '' });
            }}
            onLogFormChange={(patch) => setLogForm((prev) => ({ ...prev, ...patch }))}
            onSubmitLog={() => logSend(template)}
            onToggleReplied={(send) => toggleReplied(template.id, send)}
          />
        ))}
      </div>
    </>
  );
}

function TemplateCard({
  template,
  stats,
  dirty,
  saving,
  deleting,
  copied,
  placeholderValues,
  sendsExpanded,
  sends,
  logging,
  logForm,
  onUpdate,
  onPlaceholderChange,
  onSave,
  onDelete,
  onCopy,
  onGmail,
  onToggleSends,
  onStartLog,
  onCancelLog,
  onLogFormChange,
  onSubmitLog,
  onToggleReplied,
}: {
  template: Template;
  stats?: Stats;
  dirty: boolean;
  saving: boolean;
  deleting: boolean;
  copied: boolean;
  placeholderValues: Record<string, string>;
  sendsExpanded: boolean;
  sends: Send[];
  logging: boolean;
  logForm: { recipient_email: string; recipient_name: string; notes: string };
  onUpdate: (patch: Partial<Template>) => void;
  onPlaceholderChange: (key: string, value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onGmail: () => void;
  onToggleSends: () => void;
  onStartLog: () => void;
  onCancelLog: () => void;
  onLogFormChange: (patch: Partial<{ recipient_email: string; recipient_name: string; notes: string }>) => void;
  onSubmitLog: () => void;
  onToggleReplied: (send: Send) => void;
}) {
  const placeholders = useMemo(() => extractPlaceholders(template), [template]);
  const sent = stats?.sent ?? 0;
  const replied = stats?.replied ?? 0;
  const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;

  return (
    <div className="portal-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
            <select
              value={template.category}
              onChange={(e) => onUpdate({ category: e.target.value })}
              className="filter-search"
              style={{ fontSize: 11, padding: '3px 6px', width: 'auto' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              {!CATEGORIES.includes(template.category) && (
                <option value={template.category}>{template.category}</option>
              )}
            </select>
            {sent > 0 && (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: replyRate >= 20 ? '#f0fdf4' : '#f3f4f6',
                  color: replyRate >= 20 ? '#166534' : '#6b7280',
                  border: `1px solid ${replyRate >= 20 ? '#bbf7d0' : '#e5e7eb'}`,
                }}
              >
                {sent} sent · {replied} replied ({replyRate}%)
              </span>
            )}
            {dirty && (
              <span style={{ fontSize: 11, color: '#b45309' }}>• unsaved</span>
            )}
          </div>
          <input
            type="text"
            value={template.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="filter-search"
            style={{ fontSize: 15, fontWeight: 600, color: '#111827', width: '100%', border: 'none', padding: '2px 0' }}
          />
        </div>
        <button
          onClick={onDelete}
          disabled={deleting}
          title="Delete template"
          style={{
            background: 'transparent',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            color: '#9ca3af',
            fontSize: 12,
            padding: '4px 8px',
            cursor: deleting ? 'wait' : 'pointer',
          }}
        >
          {deleting ? '...' : 'Delete'}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 260px',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={labelStyle}>Subject Line</label>
            <input
              type="text"
              className="filter-search"
              value={template.subject}
              onChange={(e) => onUpdate({ subject: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Body</label>
            <textarea
              value={template.body}
              onChange={(e) => onUpdate({ body: e.target.value })}
              style={{
                width: '100%',
                minHeight: 220,
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

        <div
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            padding: '0.75rem',
          }}
        >
          <div style={labelStyle}>Placeholders</div>
          {placeholders.length === 0 ? (
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              No <code>{'{{tokens}}'}</code> detected in subject or body.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {placeholders.map((name) => (
                <div key={name}>
                  <label style={{ fontSize: 10, color: '#6b7280', display: 'block', marginBottom: 2 }}>
                    {humanizePlaceholder(name)}
                  </label>
                  <input
                    type="text"
                    value={placeholderValues[name] ?? ''}
                    onChange={(e) => onPlaceholderChange(name, e.target.value)}
                    placeholder={`{{${name}}}`}
                    className="filter-search"
                    style={{ width: '100%', fontSize: 12, padding: '4px 6px' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: '0.875rem', flexWrap: 'wrap' }}>
        <button
          className="portal-btn portal-btn-primary"
          onClick={onSave}
          disabled={saving || !dirty}
          style={{ opacity: !dirty ? 0.5 : 1 }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button className="portal-btn portal-btn-ghost" onClick={onCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button className="portal-btn portal-btn-ghost" onClick={onGmail}>
          Open in Gmail
        </button>
        <button className="portal-btn portal-btn-ghost" onClick={onStartLog}>
          Log Send
        </button>
        <button
          className="portal-btn portal-btn-ghost"
          onClick={onToggleSends}
          style={{ marginLeft: 'auto' }}
        >
          {sendsExpanded ? 'Hide' : 'Show'} Sends ({sent})
        </button>
      </div>

      {logging && (
        <div
          style={{
            marginTop: '0.875rem',
            padding: '0.75rem',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 4,
          }}
        >
          <div style={{ ...labelStyle, color: '#92400e' }}>Log this send</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Recipient name"
              value={logForm.recipient_name}
              onChange={(e) => onLogFormChange({ recipient_name: e.target.value })}
              className="filter-search"
              style={{ fontSize: 12, padding: '4px 6px' }}
            />
            <input
              type="email"
              placeholder="Recipient email"
              value={logForm.recipient_email}
              onChange={(e) => onLogFormChange({ recipient_email: e.target.value })}
              className="filter-search"
              style={{ fontSize: 12, padding: '4px 6px' }}
            />
          </div>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={logForm.notes}
            onChange={(e) => onLogFormChange({ notes: e.target.value })}
            className="filter-search"
            style={{ width: '100%', fontSize: 12, padding: '4px 6px', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="portal-btn portal-btn-primary" onClick={onSubmitLog}>
              Save send
            </button>
            <button className="portal-btn portal-btn-ghost" onClick={onCancelLog}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {sendsExpanded && (
        <div style={{ marginTop: '0.875rem', borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
          {sends.length === 0 ? (
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              No sends logged yet. Click &quot;Log Send&quot; after you send a message.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sends.map((send) => (
                <div
                  key={send.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px',
                    background: send.replied_at ? '#f0fdf4' : '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#111827', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {send.recipient_name || send.recipient_email || 'Unnamed'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 11 }}>
                      {formatDate(send.sent_at)}
                      {send.recipient_email && send.recipient_name && ` · ${send.recipient_email}`}
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleReplied(send)}
                    style={{
                      background: send.replied_at ? '#16a34a' : 'transparent',
                      color: send.replied_at ? 'white' : '#6b7280',
                      border: `1px solid ${send.replied_at ? '#16a34a' : '#d1d5db'}`,
                      borderRadius: 4,
                      fontSize: 11,
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {send.replied_at ? '✓ Replied' : 'Mark replied'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: 4,
  fontWeight: 500,
};
