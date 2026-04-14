'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { UserProfile, UserRole } from '@/lib/types';

interface PendingInvite {
  id: string;
  email: string;
  role: UserRole;
  expires_at: string;
  created_at: string;
}

interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  subscription_tier: string;
  settings?: { brand?: { logo_url?: string; tagline?: string } };
}

interface Props {
  currentUserId: string;
  org: OrgInfo | null;
  initialMembers: UserProfile[];
  initialPending: PendingInvite[];
}

export default function MembersClient({
  currentUserId,
  org,
  initialMembers,
  initialPending,
}: Props) {
  const router = useRouter();
  const [members, setMembers] = useState<UserProfile[]>(initialMembers);
  const [pending, setPending] = useState<PendingInvite[]>(initialPending);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [inviting, setInviting] = useState(false);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setInviting(true);
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to send invite');
      }
      setMessage(`Invite sent to ${email}.`);
      setEmail('');
      setRole('viewer');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setInviting(false);
    }
  }

  async function changeRole(memberId: string, newRole: UserRole) {
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  }

  async function removeMember(member: UserProfile) {
    if (!confirm(`Remove ${member.full_name ?? member.email} from this workspace? Their account stays active but they lose access here.`)) return;
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to remove');
      }
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    }
  }

  async function revokeInvite(invite: PendingInvite) {
    if (!confirm(`Revoke pending invite for ${invite.email}?`)) return;
    try {
      const res = await fetch(`/api/admin/members/${invite.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke_invite' }),
      });
      if (!res.ok) throw new Error('Failed to revoke');
      setPending((prev) => prev.filter((p) => p.id !== invite.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke');
    }
  }

  return (
    <>
      <div className="portal-header">
        <h1>Members</h1>
        <Link href="/portal/admin" className="portal-btn portal-btn-ghost">&larr; Admin</Link>
      </div>

      {org && (
        <div className="portal-card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 16 }}>
          {org.settings?.brand?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.settings.brand.logo_url}
              alt={org.name}
              style={{ height: 36, width: 'auto', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 2 }}>
              Workspace
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#111827' }}>{org.name}</div>
            {org.settings?.brand?.tagline && (
              <div style={{ fontSize: 12, color: '#6b7280' }}>{org.settings.brand.tagline}</div>
            )}
          </div>
          <div
            style={{
              fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 10,
              background: org.subscription_tier === 'premium' ? '#fef3c7' : '#f3f4f6',
              color: org.subscription_tier === 'premium' ? '#92400e' : '#374151',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}
          >
            {org.subscription_tier}
          </div>
        </div>
      )}

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1rem', lineHeight: 1.6 }}>
        Members of this workspace can sign in to view intel, generate documents, and use the toolkit.
        Admins can invite, remove, and change roles.
      </p>

      {error && (
        <div className="portal-card" style={{ borderColor: '#fca5a5', background: '#fef2f2', marginBottom: '1rem' }}>
          <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}
      {message && (
        <div className="portal-card" style={{ borderColor: '#86efac', background: '#f0fdf4', marginBottom: '1rem' }}>
          <p style={{ fontSize: 13, color: '#166534', margin: 0 }}>{message}</p>
        </div>
      )}

      <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">Invite a Member</span>
        </div>
        <form
          onSubmit={sendInvite}
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, alignItems: 'end' }}
        >
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="filter-search"
              style={{ width: '100%' }}
              disabled={inviting}
            />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="filter-search"
              style={{ width: '100%' }}
              disabled={inviting}
            >
              <option value="viewer">Viewer (read-only)</option>
              <option value="editor">Editor (can curate)</option>
              <option value="admin">Admin (full control)</option>
            </select>
          </div>
          <button type="submit" className="portal-btn portal-btn-primary" disabled={inviting || !email}>
            {inviting ? 'Sending…' : 'Send Invite'}
          </button>
        </form>
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
          They&rsquo;ll receive a branded invitation email with a magic link valid for 7 days.
        </p>
      </div>

      {pending.length > 0 && (
        <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
          <div className="portal-card-header">
            <span className="portal-card-title">Pending Invitations · {pending.length}</span>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Sent</th>
                <th style={thStyle}>Expires</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>{inv.email}</td>
                  <td style={tdStyle}>
                    <span className={`status-badge status-${roleBadge(inv.role)}`}>{inv.role}</span>
                  </td>
                  <td style={{ ...tdStyle, color: '#9ca3af', fontSize: 12 }}>
                    {formatDate(inv.created_at)}
                  </td>
                  <td style={{ ...tdStyle, color: '#9ca3af', fontSize: 12 }}>
                    {formatDate(inv.expires_at)}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => revokeInvite(inv)}
                      style={{
                        background: 'none',
                        border: '1px solid #fca5a5',
                        color: '#dc2626',
                        padding: '4px 10px',
                        borderRadius: 3,
                        cursor: 'pointer',
                        fontSize: 11,
                      }}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="portal-card">
        <div className="portal-card-header">
          <span className="portal-card-title">Active Members · {members.length}</span>
        </div>
        {members.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af' }}>No members yet.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Joined</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isYou = m.id === currentUserId;
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ ...tdStyle, fontWeight: 500, color: '#111827' }}>
                      {m.full_name ?? '—'}
                      {isYou && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>(you)</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: '#4b5563' }}>{m.email}</td>
                    <td style={tdStyle}>
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m.id, e.target.value as UserRole)}
                        disabled={isYou}
                        style={{
                          fontSize: 11,
                          padding: '3px 6px',
                          border: '1px solid #d1d5db',
                          borderRadius: 3,
                          background: 'white',
                          cursor: isYou ? 'default' : 'pointer',
                          opacity: isYou ? 0.6 : 1,
                        }}
                      >
                        <option value="viewer">viewer</option>
                        <option value="editor">editor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ ...tdStyle, color: '#9ca3af', fontSize: 12 }}>
                      {formatDate(m.created_at)}
                    </td>
                    <td style={tdStyle}>
                      {!isYou && (
                        <button
                          onClick={() => removeMember(m)}
                          title="Remove from workspace"
                          style={{
                            background: 'none',
                            border: '1px solid #fca5a5',
                            color: '#dc2626',
                            padding: '4px 10px',
                            borderRadius: 3,
                            cursor: 'pointer',
                            fontSize: 11,
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function roleBadge(role: UserRole): string {
  if (role === 'admin') return 'active';
  if (role === 'editor') return 'watching';
  return 'passed';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 4,
  fontWeight: 500,
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'middle',
};
