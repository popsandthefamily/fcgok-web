import { createClient } from '@/lib/supabase/server';
import type { Organization, UserProfile } from '@/lib/types';

interface OrgWithUsers extends Organization {
  users: UserProfile[];
}

export default async function ClientsPage() {
  const supabase = await createClient();

  // Fetch all organizations
  const { data: orgs } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch all user profiles grouped by org
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const organizations: OrgWithUsers[] = ((orgs as Organization[]) ?? []).map((org) => ({
    ...org,
    users: ((profiles as UserProfile[]) ?? []).filter((p) => p.organization_id === org.id),
  }));

  // Users with no org
  const unassigned = ((profiles as UserProfile[]) ?? []).filter((p) => !p.organization_id);

  const tierColors: Record<string, { bg: string; color: string }> = {
    standard: { bg: '#f3f4f6', color: '#374151' },
    premium: { bg: '#fef3c7', color: '#92400e' },
  };

  return (
    <>
      <div className="portal-header">
        <h1>Clients</h1>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Organizations list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {organizations.length === 0 ? (
          <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>No organizations yet.</p>
          </div>
        ) : (
          organizations.map((org) => {
            const tier = tierColors[org.subscription_tier] ?? tierColors.standard;
            return (
              <div key={org.id} className="portal-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                      {org.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 500, padding: '3px 10px',
                        borderRadius: 10, background: tier.bg, color: tier.color,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}
                    >
                      {org.subscription_tier}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>
                    Created {new Date(org.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {org.slug && (
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: '0.75rem' }}>
                    Slug: <span style={{ fontFamily: 'monospace' }}>{org.slug}</span>
                  </div>
                )}

                {/* Users table */}
                {org.users.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                        <th style={{ padding: '6px 10px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Name
                        </th>
                        <th style={{ padding: '6px 10px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Email
                        </th>
                        <th style={{ padding: '6px 10px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Role
                        </th>
                        <th style={{ padding: '6px 10px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {org.users.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 500, color: '#111827' }}>
                            {user.full_name ?? '--'}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#4b5563' }}>
                            {user.email}
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <span className={`status-badge ${user.role === 'admin' ? 'status-active' : user.role === 'editor' ? 'status-watching' : 'status-passed'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', color: '#9ca3af', fontSize: 12 }}>
                            {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>No users in this organization.</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Unassigned users */}
      {unassigned.length > 0 && (
        <div className="portal-card" style={{ marginBottom: '2rem' }}>
          <span className="portal-card-title">Unassigned Users</span>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '6px 10px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</th>
                <th style={{ padding: '6px 10px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</th>
                <th style={{ padding: '6px 10px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</th>
                <th style={{ padding: '6px 10px', fontWeight: 500, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {unassigned.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 500, color: '#111827' }}>{user.full_name ?? '--'}</td>
                  <td style={{ padding: '8px 10px', color: '#4b5563' }}>{user.email}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span className={`status-badge ${user.role === 'admin' ? 'status-active' : 'status-passed'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', color: '#9ca3af', fontSize: 12 }}>
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite user placeholder */}
      <div className="portal-card">
        <span className="portal-card-title">Invite User</span>
        <div style={{ marginTop: '1rem', padding: '2rem', border: '2px dashed #e5e7eb', borderRadius: 6, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 0.5rem' }}>
            User invitation system coming soon.
          </p>
          <p style={{ fontSize: 12, color: '#d1d5db', margin: 0 }}>
            Send invite links with org assignment and role pre-configured.
          </p>
        </div>
      </div>
    </>
  );
}
