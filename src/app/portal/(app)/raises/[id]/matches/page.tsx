import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { computeRaiseMatches } from '@/lib/matching/get-matches';
import { FIT_WEIGHTS } from '@/lib/matching/score';
import type { Raise } from '@/lib/types/raises';
import type { PipelineStage } from '@/lib/types/pipeline';
import MatchCard from './MatchCard';
import RefreshButton from './RefreshButton';

export const dynamic = 'force-dynamic';

const LIMIT_OPTIONS = [10, 25, 50, 100];

export default async function RaiseMatchesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ limit?: string }>;
}) {
  const auth = await getAuthedUser();
  if (!auth) redirect('/portal/login');
  if (!auth.orgId) redirect('/portal');

  const { id } = await params;
  const { limit: limitParam } = await searchParams;
  const limitNum = parseInt(limitParam ?? '25', 10);
  const limit = LIMIT_OPTIONS.includes(limitNum) ? limitNum : 25;

  const supabase = await createServiceClient();
  const { data: raise } = await supabase
    .from('raises')
    .select('*')
    .eq('id', id)
    .eq('organization_id', auth.orgId)
    .single();
  if (!raise) notFound();

  const { matches } = await computeRaiseMatches(supabase, raise as Raise, limit);

  // Map of entity_id → current pipeline stage so MatchCard can switch
  // "Add to pipeline" → "In pipeline · stage" without re-querying per card.
  const { data: pipelineRows } = await supabase
    .from('raise_pipeline')
    .select('entity_id, stage')
    .eq('raise_id', id);
  const pipelineByEntity = new Map<string, PipelineStage>();
  for (const r of (pipelineRows ?? []) as { entity_id: string; stage: PipelineStage }[]) {
    pipelineByEntity.set(r.entity_id, r.stage);
  }

  const profileGaps = describeProfileGaps(raise as Raise);

  return (
    <>
      <div className="portal-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>Investor Matches</h1>
          <span style={{ fontSize: 13, color: '#6b7280' }}>{(raise as Raise).name}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Link href={`/portal/raises/${id}`} className="portal-btn portal-btn-ghost">&larr; Raise</Link>
          <Link href={`/portal/raises/${id}/pipeline`} className="portal-btn portal-btn-ghost">
            Pipeline ({pipelineByEntity.size})
          </Link>
          <RefreshButton
            raiseId={id}
            limit={limit}
            pendingCount={matches.filter((m) => m.rationale == null || m.rationale_stale).length}
            totalCount={matches.length}
          />
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1rem', lineHeight: 1.6 }}>
        Investors ranked against this raise's profile. Scores are deterministic
        and update live as you edit the raise. AI rationale is generated on
        demand and cached until you edit the raise again.
      </p>

      {profileGaps.length > 0 && (
        <div className="portal-card" style={{ marginBottom: '1rem', borderColor: '#fde68a', background: '#fffbeb' }}>
          <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
            <strong>Better matches with more profile fields:</strong> {profileGaps.join(', ')} are
            unset on this raise — they default to neutral (50%) for everyone, which dampens ranking.
            <Link href={`/portal/raises/${id}`} style={{ color: '#92400e', textDecoration: 'underline', marginLeft: 6 }}>
              Edit raise
            </Link>
          </div>
        </div>
      )}

      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Show top:
        </span>
        {LIMIT_OPTIONS.map((n) => (
          <Link
            key={n}
            href={`/portal/raises/${id}/matches?limit=${n}`}
            className={`filter-chip${limit === n ? ' active' : ''}`}
          >
            {n}
          </Link>
        ))}
      </div>

      {matches.length === 0 ? (
        <div className="portal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            No tracked investors yet. Add some via{' '}
            <Link href="/portal/admin/entities">Manage Entities</Link>.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {matches.map((m, i) => (
            <MatchCard
              key={m.entity.id}
              rank={i + 1}
              match={m}
              weights={FIT_WEIGHTS}
              raiseId={id}
              inPipelineStage={pipelineByEntity.get(m.entity.id) ?? null}
            />
          ))}
        </div>
      )}
    </>
  );
}

function describeProfileGaps(raise: Raise): string[] {
  const gaps: string[] = [];
  if (!raise.asset_class) gaps.push('asset class');
  if (!raise.geography?.length) gaps.push('geography');
  if (raise.min_check_usd == null && raise.max_check_usd == null && raise.amount_sought_usd == null) {
    gaps.push('check size');
  }
  if (!raise.structure) gaps.push('structure');
  if (!raise.stage) gaps.push('stage');
  return gaps;
}
