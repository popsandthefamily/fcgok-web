'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WheelLoader } from '@/components/BuggyWheel';

interface OrgSettings {
  logo_url?: string;
  brand_primary?: string;
  brand_secondary?: string;
  tagline?: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgSettings, setOrgSettings] = useState<OrgSettings>({});
  const [logoUploading, setLogoUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Failed to load profile (${res.status})`);
        }
        const { user, profile } = await res.json();

        setUserEmail(user.email ?? '');
        setFullName(profile?.full_name ?? '');
        setIsAdmin(profile?.role === 'admin');

        const org = profile?.organizations;
        if (org) {
          setOrgName(org.name ?? '');
          setOrgSettings(org.settings ?? {});
        }
      } catch (err) {
        setMessage('Error loading: ' + (err instanceof Error ? err.message : 'unknown'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveProfile() {
    setSaving(true);
    setMessage('');

    try {
      // Save user profile
      const profileRes = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      });
      if (!profileRes.ok) {
        const body = await profileRes.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save profile');
      }

      // Save org settings if admin
      if (isAdmin) {
        const orgRes = await fetch('/api/organization', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: orgName, settings: orgSettings }),
        });
        if (!orgRes.ok) {
          const body = await orgRes.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to save organization');
        }
      }

      setMessage('Saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error saving: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(file: File) {
    setLogoUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/organization/logo', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Upload failed');
      }

      const { url } = await res.json();
      setOrgSettings({ ...orgSettings, logo_url: url });
      setMessage('Logo uploaded. Click Save to persist.');
    } catch (err) {
      setMessage('Upload failed: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setLogoUploading(false);
    }
  }

  if (loading) {
    return <WheelLoader label="Loading settings…" />;
  }

  return (
    <>
      <div className="portal-header">
        <h1>Settings</h1>
        <Link href="/portal" className="portal-btn portal-btn-ghost">&larr; Dashboard</Link>
      </div>

      {message && (
        <div
          className="portal-card"
          style={{
            marginBottom: '1rem',
            borderColor: message.startsWith('Error') ? '#fca5a5' : '#86efac',
            background: message.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: message.startsWith('Error') ? '#991b1b' : '#166534' }}>{message}</p>
        </div>
      )}

      {/* User profile */}
      <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">Your Profile</span>
        </div>

        <Field label="Email">
          <input type="email" value={userEmail} disabled className="filter-search" style={{ width: '100%', background: '#f9fafb' }} />
        </Field>
        <Field label="Full Name">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="filter-search"
            style={{ width: '100%' }}
          />
        </Field>
      </div>

      {/* Company branding */}
      <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
        <div className="portal-card-header">
          <span className="portal-card-title">Company Branding</span>
          {!isAdmin && <span style={{ fontSize: 11, color: '#9ca3af' }}>Admin only</span>}
        </div>

        <Field label="Company Name">
          <input
            type="text"
            value={orgName}
            disabled={!isAdmin}
            onChange={(e) => setOrgName(e.target.value)}
            className="filter-search"
            style={{ width: '100%' }}
          />
        </Field>

        <Field label="Tagline">
          <input
            type="text"
            value={orgSettings.tagline ?? ''}
            disabled={!isAdmin}
            onChange={(e) => setOrgSettings({ ...orgSettings, tagline: e.target.value })}
            placeholder="e.g., Self-storage development and capital placement"
            className="filter-search"
            style={{ width: '100%' }}
          />
        </Field>

        <Field label="Company Logo">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {orgSettings.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={orgSettings.logo_url}
                alt="Logo"
                style={{ height: 48, width: 'auto', border: '1px solid #e5e7eb', borderRadius: 4, padding: 4, background: 'white' }}
              />
            )}
            {isAdmin && (
              <label
                className="portal-btn portal-btn-ghost"
                style={{ cursor: logoUploading ? 'wait' : 'pointer', display: 'inline-flex' }}
              >
                {logoUploading ? 'Uploading...' : orgSettings.logo_url ? 'Replace Logo' : 'Upload Logo'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  disabled={logoUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadLogo(file);
                  }}
                />
              </label>
            )}
            {!isAdmin && !orgSettings.logo_url && (
              <span style={{ fontSize: 12, color: '#9ca3af' }}>No logo uploaded yet</span>
            )}
          </div>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Brand Primary Color">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={orgSettings.brand_primary ?? '#1a3a2a'}
                disabled={!isAdmin}
                onChange={(e) => setOrgSettings({ ...orgSettings, brand_primary: e.target.value })}
                style={{ width: 48, height: 36, border: '1px solid #d1d5db', borderRadius: 4, padding: 0, cursor: isAdmin ? 'pointer' : 'default' }}
              />
              <input
                type="text"
                value={orgSettings.brand_primary ?? '#1a3a2a'}
                disabled={!isAdmin}
                onChange={(e) => setOrgSettings({ ...orgSettings, brand_primary: e.target.value })}
                className="filter-search"
                style={{ flex: 1 }}
              />
            </div>
          </Field>
          <Field label="Brand Accent Color">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={orgSettings.brand_secondary ?? '#dbb532'}
                disabled={!isAdmin}
                onChange={(e) => setOrgSettings({ ...orgSettings, brand_secondary: e.target.value })}
                style={{ width: 48, height: 36, border: '1px solid #d1d5db', borderRadius: 4, padding: 0, cursor: isAdmin ? 'pointer' : 'default' }}
              />
              <input
                type="text"
                value={orgSettings.brand_secondary ?? '#dbb532'}
                disabled={!isAdmin}
                onChange={(e) => setOrgSettings({ ...orgSettings, brand_secondary: e.target.value })}
                className="filter-search"
                style={{ flex: 1 }}
              />
            </div>
          </Field>
        </div>
      </div>

      <button
        className="portal-btn portal-btn-primary"
        onClick={saveProfile}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
