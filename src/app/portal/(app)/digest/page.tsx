import { createClient } from '@/lib/supabase/server';
import type { WeeklyDigest } from '@/lib/types';
import DigestToggle from './DigestToggle';

export const metadata = { title: 'Weekly Digest' };

export default async function DigestPage() {
  const supabase = await createClient();
  const { data: digests } = await supabase
    .from('weekly_digests')
    .select('*')
    .order('week_start', { ascending: false });

  const items = (digests as WeeklyDigest[] | null) ?? [];

  return (
    <>
      <div className="portal-header">
        <h1>Weekly Digest Archive</h1>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {items.length} digest{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            No digests generated yet. Check back after the first weekly run.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((digest) => {
            const weekStart = new Date(digest.week_start).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const weekEnd = new Date(digest.week_end).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const generatedAt = new Date(digest.generated_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <div key={digest.id} className="portal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
                      {weekStart} &ndash; {weekEnd}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {digest.item_count} item{digest.item_count !== 1 ? 's' : ''} &middot; Generated {generatedAt}
                    </div>
                  </div>
                  <DigestToggle content={digest.content} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
