// LLM rationale generation for (raise, investor) pairs.
//
// Takes deterministic fit + raw context, returns 2-3 sentence prose
// explaining why this investor is or isn't a match for this raise.
// Cached in raise_fit_scores.rationale, keyed by raise.updated_at as
// the version hash.

import { generateText } from '@/lib/ai/provider';
import type { Raise, InvestorMandate } from '@/lib/types/raises';
import type { TrackedEntity, IntelItem } from '@/lib/types';
import type { FitResult } from './score';

export interface RationaleInput {
  raise: Raise;
  entity: TrackedEntity;
  mandate: InvestorMandate | null;
  intelItems: IntelItem[];
  fit: FitResult;
}

const SYSTEM = `You are a private capital advisor helping a sponsor identify which investors to approach for a specific deal.

Given a raise, an investor entity, the investor's mandate, recent intel, and a deterministic fit score with reasons, write a 2-3 sentence rationale explaining why this investor is (or isn't) a strong match for this raise.

Rules:
- Lead with the strongest match factor.
- Be specific: cite asset class, geography, check size, recent activity, etc.
- If the score is low (<40), explain the mismatch honestly rather than forcing a sell.
- Do NOT invent facts. Only use what's provided.
- No markdown, no bullets, no headers. Plain prose only.
- Maximum 60 words.`;

function fmtUsd(n: number | null | undefined): string {
  if (n == null) return '—';
  return `$${n.toLocaleString()}`;
}

function summarizeRaise(r: Raise): string {
  const lines: string[] = [`Name: ${r.name}`];
  if (r.asset_class) lines.push(`Asset class: ${r.asset_class}`);
  if (r.stage) lines.push(`Stage: ${r.stage}`);
  if (r.structure) lines.push(`Structure: ${r.structure}`);
  if (r.geography?.length) lines.push(`Geography: ${r.geography.join(', ')}`);
  if (r.amount_sought_usd != null) lines.push(`Amount sought: ${fmtUsd(r.amount_sought_usd)}`);
  if (r.min_check_usd != null || r.max_check_usd != null) {
    lines.push(`Check range: ${fmtUsd(r.min_check_usd)} – ${fmtUsd(r.max_check_usd)}`);
  }
  if (r.use_of_funds) lines.push(`Use of funds: ${r.use_of_funds}`);
  if (r.target_close_date) lines.push(`Target close: ${r.target_close_date}`);
  return lines.join('\n');
}

function summarizeMandate(m: InvestorMandate | null): string {
  if (!m) return '(no mandate data on file — sparse signal)';
  const lines: string[] = [];
  if (m.asset_classes?.length) lines.push(`Asset classes: ${m.asset_classes.join(', ')}`);
  if (m.geography?.length) lines.push(`Geography: ${m.geography.join(', ')}`);
  if (m.stages?.length) lines.push(`Stages: ${m.stages.join(', ')}`);
  if (m.structures?.length) lines.push(`Structures: ${m.structures.join(', ')}`);
  if (m.check_min_usd != null || m.check_max_usd != null) {
    lines.push(`Check range: ${fmtUsd(m.check_min_usd)} – ${fmtUsd(m.check_max_usd)}`);
  }
  if (m.notes) lines.push(`Notes: ${m.notes}`);
  lines.push(`Mandate confidence: ${m.confidence}`);
  return lines.length ? lines.join('\n') : '(mandate row exists but has no fields filled)';
}

function summarizeIntel(items: IntelItem[]): string {
  if (!items.length) return '(no recent intel on file)';
  return items
    .slice(0, 5)
    .map((i) => {
      const date = i.published_at ? new Date(i.published_at).toLocaleDateString() : 'undated';
      const summary = i.summary?.slice(0, 200);
      return summary ? `- [${date}] ${i.title} — ${summary}` : `- [${date}] ${i.title}`;
    })
    .join('\n');
}

export async function generateRationale(input: RationaleInput): Promise<string> {
  const { raise, entity, mandate, intelItems, fit } = input;

  const userMessage = [
    `RAISE`,
    summarizeRaise(raise),
    ``,
    `INVESTOR`,
    `Name: ${entity.name}`,
    `Type: ${entity.entity_type}`,
    entity.description ? `Description: ${entity.description}` : null,
    ``,
    `MANDATE`,
    summarizeMandate(mandate),
    ``,
    `RECENT INTEL`,
    summarizeIntel(intelItems),
    ``,
    `FIT SCORE: ${fit.score}/100`,
    `Top match factors: ${fit.reasons.join(' · ') || '(none — sparse data on both sides)'}`,
    ``,
    `Write the 2-3 sentence rationale.`,
  ]
    .filter((l) => l !== null)
    .join('\n');

  // 'speed' preference puts Groq first — much faster for batched parallel calls.
  const text = await generateText(SYSTEM, userMessage, 256, 'speed');
  return text.trim();
}
