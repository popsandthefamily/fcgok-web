'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgSettings, setOrgSettings] = useState<OrgSettings>({});
  const [logoUploading, setLogoUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      setUserEmail(user.email ?? '');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name ?? '');
        setIsAdmin(profile.role === 'admin');
        const orgRaw = profile.organizations as unknown;
        const org = orgRaw as { id: string; name: string; slug: string; settings?: OrgSettings } | null;
        if (org) {
          setOrgId(org.id);
          setOrgName(org.name);
          setOrgSlug(org.slug);
          setOrgSettings(org.settings ?? {});
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function saveProfile() {
    setSaving(true);
    setMessage('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    let orgError = null;
    if (isAdmin && orgId) {
      const { error } = await supabase
        .from('organizations')
        .update({ name: orgName, settings: orgSettings })
        .eq('id', orgId);
      orgError = error;
    }

    setSaving(false);
    if (profileError || orgError) {
      setMessage('Error saving: ' + (profileError?.message ?? orgError?.message));
    } else {
      setMessage('Saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function uploadLogo(file: File) {
    if (!orgSlug) return;
    setLogoUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop() ?? 'png';
    const path = `${orgSlug}/logo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('branding')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      setMessage('Upload failed: ' + error.message);
      setLogoUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('branding').getPublicUrl(path);
    setOrgSettings({ ...orgSettings, logo_url: urlData.publicUrl });
    setLogoUploading(false);
    setMessage('Logo uploaded. Click Save to persist.');
  }

  if (loading) {
    return <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading...</p>;
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
          {!isAdmin && (
            <span style={{ fontSize: 11, color: '#9ca3af' }}>Admin only</span>
          )}
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
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
                style={{ cursor: logoUploading ? 'wait' : 'pointer' }}
              >
                {logoUploading ? 'Uploading...' : 'Upload Logo'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadLogo(file);
                  }}
                />
              </label>
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
