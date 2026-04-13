'use client';

import { useEffect, useState, useCallback } from 'react';
import type { TrackedEntity, EntityType, EntityCategory, EntityStatus } from '@/lib/types';

const ENTITY_TYPES: EntityType[] = ['company', 'person', 'fund'];
const ENTITY_CATEGORIES: EntityCategory[] = ['lender', 'equity_investor', 'broker', 'developer', 'operator', 'reit'];
const ENTITY_STATUSES: EntityStatus[] = ['active', 'watching', 'contacted', 'engaged', 'passed'];

const EMPTY_FORM = {
  name: '',
  entity_type: 'company' as EntityType,
  categories: [] as EntityCategory[],
  description: '',
  status: 'watching' as EntityStatus,
  geography: '',
  deal_size_min: '',
  deal_size_max: '',
  linkedin_url: '',
  website: '',
};

export default function EntitiesPage() {
  const [entities, setEntities] = useState<TrackedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/entities');
    const json = await res.json();
    const list = (json.entities as TrackedEntity[] | undefined) ?? [];
    list.sort((a, b) => a.name.localeCompare(b.name));
    setEntities(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  function toggleCategory(categories: EntityCategory[], cat: EntityCategory): EntityCategory[] {
    return categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      entity_type: form.entity_type,
      categories: form.categories,
      description: form.description.trim() || null,
      status: form.status,
      geography: form.geography.trim() ? form.geography.split(',').map((g) => g.trim()) : [],
      deal_size_min: form.deal_size_min ? parseInt(form.deal_size_min, 10) : null,
      deal_size_max: form.deal_size_max ? parseInt(form.deal_size_max, 10) : null,
      linkedin_url: form.linkedin_url.trim() || null,
      website: form.website.trim() || null,
    };

    const res = await fetch('/api/entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setForm({ ...EMPTY_FORM });
      await fetchEntities();
    } else {
      const json = await res.json().catch(() => ({}));
      alert('Error creating entity: ' + (json.error ?? res.statusText));
    }
    setSaving(false);
  }

  function startEdit(entity: TrackedEntity) {
    setEditingId(entity.id);
    setEditForm({
      name: entity.name,
      entity_type: entity.entity_type,
      categories: entity.categories,
      description: entity.description ?? '',
      status: entity.status,
      geography: entity.geography?.join(', ') ?? '',
      deal_size_min: entity.deal_size_min?.toString() ?? '',
      deal_size_max: entity.deal_size_max?.toString() ?? '',
      linkedin_url: entity.linkedin_url ?? '',
      website: entity.website ?? '',
    });
  }

  async function handleUpdate(id: string) {
    setSaving(true);

    const payload = {
      name: editForm.name.trim(),
      entity_type: editForm.entity_type,
      categories: editForm.categories,
      description: editForm.description.trim() || null,
      status: editForm.status,
      geography: editForm.geography.trim() ? editForm.geography.split(',').map((g) => g.trim()) : [],
      deal_size_min: editForm.deal_size_min ? parseInt(editForm.deal_size_min, 10) : null,
      deal_size_max: editForm.deal_size_max ? parseInt(editForm.deal_size_max, 10) : null,
      linkedin_url: editForm.linkedin_url.trim() || null,
      website: editForm.website.trim() || null,
    };

    const res = await fetch(`/api/entities/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setEditingId(null);
      await fetchEntities();
    } else {
      const json = await res.json().catch(() => ({}));
      alert('Error updating entity: ' + (json.error ?? res.statusText));
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entity? This cannot be undone.')) return;
    const res = await fetch(`/api/entities/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setEntities((prev) => prev.filter((e) => e.id !== id));
    } else {
      const json = await res.json().catch(() => ({}));
      alert('Error deleting entity: ' + (json.error ?? res.statusText));
    }
  }

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '6px 10px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 4, background: 'white' };
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'auto' as const };

  return (
    <>
      <div className="portal-header">
        <h1>Manage Entities</h1>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{entities.length} tracked</span>
      </div>

      {/* Add new entity form */}
      <div className="portal-card" style={{ marginBottom: '1.5rem' }}>
        <span className="portal-card-title">Add New Entity</span>
        <form onSubmit={handleCreate} style={{ marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
                placeholder="Entity name"
              />
            </div>
            <div>
              <label style={labelStyle}>Type *</label>
              <select
                value={form.entity_type}
                onChange={(e) => setForm({ ...form, entity_type: e.target.value as EntityType })}
                style={selectStyle}
              >
                {ENTITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EntityStatus })}
                style={selectStyle}
              >
                {ENTITY_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Geography (comma-separated)</label>
              <input
                type="text"
                value={form.geography}
                onChange={(e) => setForm({ ...form, geography: e.target.value })}
                style={inputStyle}
                placeholder="Oklahoma, Texas, Southeast"
              />
            </div>
            <div>
              <label style={labelStyle}>Deal Size Min ($)</label>
              <input
                type="number"
                value={form.deal_size_min}
                onChange={(e) => setForm({ ...form, deal_size_min: e.target.value })}
                style={inputStyle}
                placeholder="1000000"
              />
            </div>
            <div>
              <label style={labelStyle}>Deal Size Max ($)</label>
              <input
                type="number"
                value={form.deal_size_max}
                onChange={(e) => setForm({ ...form, deal_size_max: e.target.value })}
                style={inputStyle}
                placeholder="50000000"
              />
            </div>
            <div>
              <label style={labelStyle}>LinkedIn URL</label>
              <input
                type="url"
                value={form.linkedin_url}
                onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                style={inputStyle}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
            <div>
              <label style={labelStyle}>Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                style={inputStyle}
                placeholder="https://..."
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
              placeholder="Brief description of the entity..."
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Categories</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ENTITY_CATEGORIES.map((cat) => (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.categories.includes(cat)}
                    onChange={() => setForm({ ...form, categories: toggleCategory(form.categories, cat) })}
                  />
                  {cat.replace('_', ' ')}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="portal-btn portal-btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add Entity'}
          </button>
        </form>
      </div>

      {/* Entity list */}
      <div className="portal-card">
        <span className="portal-card-title">Tracked Entities</span>
        {loading ? (
          <p style={{ fontSize: 14, color: '#9ca3af', marginTop: '1rem' }}>Loading...</p>
        ) : entities.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9ca3af', marginTop: '1rem' }}>No entities tracked yet. Add one above.</p>
        ) : (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1px', background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
            {entities.map((entity) => {
              const isEditing = editingId === entity.id;

              if (isEditing) {
                return (
                  <div key={entity.id} style={{ background: '#fefce8', padding: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label style={labelStyle}>Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Type</label>
                        <select
                          value={editForm.entity_type}
                          onChange={(e) => setEditForm({ ...editForm, entity_type: e.target.value as EntityType })}
                          style={selectStyle}
                        >
                          {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Status</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as EntityStatus })}
                          style={selectStyle}
                        >
                          {ENTITY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Geography</label>
                        <input
                          type="text"
                          value={editForm.geography}
                          onChange={(e) => setEditForm({ ...editForm, geography: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Deal Size Min ($)</label>
                        <input
                          type="number"
                          value={editForm.deal_size_min}
                          onChange={(e) => setEditForm({ ...editForm, deal_size_min: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Deal Size Max ($)</label>
                        <input
                          type="number"
                          value={editForm.deal_size_max}
                          onChange={(e) => setEditForm({ ...editForm, deal_size_max: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>LinkedIn URL</label>
                        <input
                          type="url"
                          value={editForm.linkedin_url}
                          onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Website</label>
                        <input
                          type="url"
                          value={editForm.website}
                          onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }}
                      />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={labelStyle}>Categories</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {ENTITY_CATEGORIES.map((cat) => (
                          <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={editForm.categories.includes(cat)}
                              onChange={() => setEditForm({ ...editForm, categories: toggleCategory(editForm.categories, cat) })}
                            />
                            {cat.replace('_', ' ')}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="portal-btn portal-btn-primary" onClick={() => handleUpdate(entity.id)} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button className="portal-btn portal-btn-ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={entity.id} style={{ background: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                        {entity.name}
                      </span>
                      <span className={`status-badge status-${entity.status}`}>
                        {entity.status}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {entity.entity_type}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {entity.categories?.map((cat) => (
                        <span key={cat} className="badge badge-category">{cat.replace('_', ' ')}</span>
                      ))}
                      {entity.geography?.map((geo) => (
                        <span key={geo} style={{ fontSize: 11, background: '#f0fdf4', color: '#166534', padding: '2px 6px', borderRadius: 3 }}>
                          {geo}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="portal-btn portal-btn-ghost" style={{ padding: '6px 12px' }} onClick={() => startEdit(entity)}>
                      Edit
                    </button>
                    <button
                      className="portal-btn portal-btn-ghost"
                      style={{ padding: '6px 12px', color: '#dc2626' }}
                      onClick={() => handleDelete(entity.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
