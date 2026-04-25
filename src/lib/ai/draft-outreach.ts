// LLM-driven outreach drafting. Takes a template (with {{variable}}
// placeholders), the raise, the investor profile + mandate, and recent
// intel, and returns a personalized {subject, body} pair ready for
// human review and edit.

import { generateText } from './provider';
import type { Raise, InvestorMandate } from '@/lib/types/raises';
import type { TrackedEntity, IntelItem } from '@/lib/types';

export interface OutreachDraftInput {
  template: { subject: string; body: string; title?: string; category?: string };
  raise: Raise;
  entity: TrackedEntity;
  mandate: InvestorMandate | null;
  intelItems: IntelItem[];
}

export interface OutreachDraft {
  subject: string;
  body: string;
}

const SYSTEM = `You are a private capital advisor drafting an outreach email from a sponsor to an investor.

Given a template (with {{variable}} placeholders), the raise being pitched, the investor's profile and mandate, and recent intel, produce a personalized email.

Rules:
- Replace ALL {{variables}} with concrete values from the context. Never leave {{x}} placeholders in the output.
- If a value isn't available, paraphrase the surrounding sentence to omit it gracefully — never invent specifics.
- Match the template's tone but tighten verbose language.
- Keep the subject line under 80 characters.
- The output MUST be valid JSON in this exact shape: {"subject": "...", "body": "..."}
- Do not wrap in markdown code fences. Pure JSON only. No preamble.`;

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
  if (r.notes) lines.push(`Notes: ${r.notes}`);
  return lines.join('\n');
}

function summarizeMandate(m: InvestorMandate | null): string {
  if (!m) return '(no mandate data on file)';
  const lines: string[] = [];
  if (m.asset_classes?.length) lines.push(`Asset classes: ${m.asset_classes.join(', ')}`);
  if (m.geography?.length) lines.push(`Geography: ${m.geography.join(', ')}`);
  if (m.stages?.length) lines.push(`Stages: ${m.stages.join(', ')}`);
  if (m.structures?.length) lines.push(`Structures: ${m.structures.join(', ')}`);
  if (m.check_min_usd != null || m.check_max_usd != null) {
    lines.push(`Check range: ${fmtUsd(m.check_min_usd)} – ${fmtUsd(m.check_max_usd)}`);
  }
  if (m.notes) lines.push(`Notes: ${m.notes}`);
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

function parseDraft(raw: string): OutreachDraft {
  let text = raw.trim();
  // Strip markdown code fences if the model added them despite instructions.
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  }
  const parsed = JSON.parse(text);
  if (typeof parsed?.subject !== 'string' || typeof parsed?.body !== 'string') {
    throw new Error('Model output missing subject or body field');
  }
  return { subject: parsed.subject.trim(), body: parsed.body.trim() };
}

export async function generateOutreachDraft(input: OutreachDraftInput): Promise<OutreachDraft> {
  const { template, raise, entity, mandate, intelItems } = input;

  const userMessage = [
    `TEMPLATE`,
    template.title ? `Title: ${template.title}` : null,
    template.category ? `Category: ${template.category}` : null,
    `Subject template: ${template.subject}`,
    `Body template:\n${template.body}`,
    ``,
    `RAISE`,
    summarizeRaise(raise),
    ``,
    `INVESTOR`,
    `Name: ${entity.name}`,
    `Type: ${entity.entity_type}`,
    entity.description ? `Description: ${entity.description}` : null,
    entity.website ? `Website: ${entity.website}` : null,
    ``,
    `MANDATE`,
    summarizeMandate(mandate),
    ``,
    `RECENT INTEL`,
    summarizeIntel(intelItems),
    ``,
    `Output the personalized email as JSON.`,
  ]
    .filter((l) => l !== null)
    .join('\n');

  const raw = await generateText(SYSTEM, userMessage, 1024, 'speed');
  return parseDraft(raw);
}
