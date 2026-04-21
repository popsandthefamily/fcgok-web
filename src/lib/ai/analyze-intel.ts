import { generateText } from './provider';
import type { AIAnalysis } from '@/lib/types';
import type { Industry, PrimaryRole } from '@/lib/config/industries';

function buildSystemPrompt(industry: Industry, role: PrimaryRole, keywords: string[]): string {
  const industryLabel =
    industry === 'self-storage' ? 'self-storage'
    : industry === 'multi-family' ? 'multifamily'
    : industry;
  const roleLabel =
    role === 'developer' ? 'developer'
    : role === 'operator' ? 'operator'
    : role === 'investor' ? 'investor / capital allocator'
    : role === 'broker' ? 'broker / transaction advisor'
    : role === 'lender' ? 'lender / debt provider'
    : 'consultant / capital introduction advisor';

  return `You are an analyst for a ${industryLabel} ${roleLabel} firm. Your client focuses on these themes: ${keywords.slice(0, 8).join(', ')}.

Analyze the following content and return a JSON object with:

1. "summary": 2-3 sentence executive summary focused on actionable takeaways for this client
2. "relevance_score": 0.0 to 1.0 (how relevant is this to a ${industryLabel} ${roleLabel}?)
3. "category": one of "market_intel" | "investor_activity" | "deal_flow" | "regulatory" | "competitive" | "operational" | "distress" — pick "distress" when the content indicates financial trouble at an operator, property, or loan: debt acceleration, impairment, material adverse event, non-reliance on prior financials, abrupt officer departures, capital call, distribution suspension, CMBS watchlist/special-servicer transfer, foreclosure / Notice of Default, DSCR breach. If the item is already pre-tagged distress by the ingester, keep it "distress" unless the content clearly belongs to another category.
4. "entities": { "companies": [], "people": [], "locations": [], "dollar_amounts": [], "cap_rates": [], "fund_names": [] }
5. "tags": array of lowercase tags
6. "sentiment": "bullish" | "bearish" | "neutral" | "mixed"
7. "action_items": array of 0-3 specific actions the client could take based on this intel
8. "investor_signals": array of any signals that a person or entity mentioned might be actively deploying capital or seeking deals

Return ONLY valid JSON, no markdown fences.`;
}

export async function analyzeIntelItem(
  item: {
    title: string;
    body: string | null;
    source: string;
    author?: string | null;
  },
  orgContext?: {
    industry: Industry;
    primary_role: PrimaryRole;
    keywords: string[];
  },
): Promise<AIAnalysis> {
  const system = orgContext
    ? buildSystemPrompt(orgContext.industry, orgContext.primary_role, orgContext.keywords)
    : buildSystemPrompt('self-storage', 'developer', ['self storage', 'capital']);

  const content = [
    `Source: ${item.source}`,
    item.author ? `Author: ${item.author}` : null,
    `Title: ${item.title}`,
    item.body ? `Content:\n${item.body.slice(0, 4000)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const text = await generateText(system, content, 1024);
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as AIAnalysis;
}
