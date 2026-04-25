'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { RaiseMatch } from '@/lib/matching/get-matches';
import type { FIT_WEIGHTS } from '@/lib/matching/score';

type Weights = typeof FIT_WEIGHTS;
type ComponentKey = keyof Weights;

const COMPONENT_LABELS: Record<ComponentKey, string> = {
  asset_class: 'Asset class',
  geography:   'Geography',
  check_size:  'Check size',
  structure:   'Structure',
  stage:       'Stage',
  recency:     'Recency',
  warmth:      'Warmth',
};

const COMPONENT_KEYS: ComponentKey[] = [
  'asset_class', 'geography', 'check_size', 'structure', 'stage', 'recency', 'warmth',
];

export default function MatchCard({
  rank,
  match,
  weights,
}: {
  rank: number;
  match: RaiseMatch;
  weights: Weights;
}) {
  const [expanded, setExpanded] = useState(false);
  const { entity, fit, mandate } = match;
  const scoreColor =
    fit.score >= 70 ? '#15803d' :
    fit.score >= 45 ? '#a16207' :
    '#9ca3af';

  return (
    <div className="portal-card" style={{ padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Rank */}
        <div style={{
          flex: '0 0 auto',
          width: 32,
          textAlign: 'center',
          fontSize: 12,
          color: '#9ca3af',
          fontVariantNumeric: 'tabular-nums',
          paddingTop: 4,
        }}>
          #{rank}
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link
              href={`/portal/investors/${entity.id}`}
              style={{ fontSize: 15, fontWeight: 600, color: '#111827', textDecoration: 'none' }}
            >
              {entity.name}
            </Link>
            <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>
              {entity.entity_type}
            </span>
            {mandate && (
              <span style={{
                fontSize: 10,
                color: mandate.confidence === 'verified' ? '#15803d' : mandate.confidence === 'self_reported' ? '#1e40af' : '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                border: '1px solid currentColor',
                padding: '1px 6px',
                borderRadius: 3,
              }}>
                {mandate.confidence}
              </span>
            )}
          </div>

          {/* AI rationale (if cached) */}
          {match.rationale && (
            <div style={{
              fontSize: 13,
              color: '#1f2937',
              background: '#f0fdf4',
              borderLeft: '3px solid #22c55e',
              padding: '8px 12px',
              borderRadius: 4,
              marginBottom: 8,
              lineHeight: 1.55,
            }}>
              {match.rationale}
              {match.rationale_stale && (
                <span style={{ marginLeft: 6, fontSize: 10, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  · stale (raise edited since)
                </span>
              )}
            </div>
          )}

          {/* Top deterministic reasons */}
          {fit.reasons.length > 0 ? (
            <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 8, lineHeight: 1.5 }}>
              {fit.reasons.join(' · ')}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, fontStyle: 'italic' }}>
              No mandate data — neutral score across all factors.
            </div>
          )}

          {/* Component bars */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'stretch', marginBottom: 4 }}>
            {COMPONENT_KEYS.map((key) => {
              const points = fit.components[key] ?? 0;
              const max = weights[key];
              const ratio = points / max;
              return (
                <div
                  key={key}
                  title={`${COMPONENT_LABELS[key]}: ${points}/${max}`}
                  style={{
                    flex: max,
                    height: 6,
                    background: '#f3f4f6',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(0, Math.min(100, ratio * 100))}%`,
                      height: '100%',
                      background: ratio >= 0.66 ? '#22c55e' : ratio >= 0.33 ? '#facc15' : '#e5e7eb',
                    }}
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 11,
              color: '#6b7280',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {expanded ? '− Hide breakdown' : '+ Why this score'}
          </button>

          {expanded && (
            <div style={{
              marginTop: 10,
              padding: 10,
              background: '#fafafa',
              borderRadius: 4,
              fontSize: 12,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                {COMPONENT_KEYS.map((key) => {
                  const points = fit.components[key] ?? 0;
                  const max = weights[key];
                  return (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>{COMPONENT_LABELS[key]}</span>
                      <span style={{ color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                        {points.toFixed(1)} / {max}
                      </span>
                    </div>
                  );
                })}
              </div>
              {!mandate && (
                <div style={{ marginTop: 8, color: '#9ca3af', fontStyle: 'italic' }}>
                  No mandate row for this entity. Add one in admin → entities to improve scoring.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Score */}
        <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
          <div style={{
            fontSize: 28,
            fontWeight: 600,
            color: scoreColor,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.round(fit.score)}
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
            / 100
          </div>
        </div>
      </div>
    </div>
  );
}
