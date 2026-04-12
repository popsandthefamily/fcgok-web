import Anthropic from '@anthropic-ai/sdk';
import type { IntelItem } from '@/lib/types';

const anthropic = new Anthropic();

export async function generateWeeklyDigest(items: IntelItem[]): Promise<string> {
  const summaries = items
    .filter((i) => i.summary)
    .map(
      (i) =>
        `[${i.source.toUpperCase()}] (relevance: ${i.relevance_score?.toFixed(2)}) ${i.title}\n${i.summary}`,
    )
    .join('\n\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: `You are the intelligence analyst for Frontier Consulting Group, a capital introduction and real estate consulting firm focused on self-storage development.

Given the following ${items.length} intelligence items from the past 7 days, write a concise weekly briefing for a self-storage developer who is actively raising capital. Structure as:

1. **Market Conditions Summary** (3-4 sentences on overall market sentiment and key data points)
2. **Notable Transactions** (bullet list of significant deals, acquisitions, fund closings)
3. **Capital Markets Update** (lending environment, rate movements, investor appetite signals)
4. **Entities to Watch** (people/companies showing increased activity that could be outreach targets)
5. **Action Items for This Week** (2-4 specific, concrete next steps)

Be direct and analytical. No filler. Every sentence should contain actionable information or a specific data point. Write for someone who makes decisions based on this briefing.`,
    messages: [{ role: 'user', content: summaries }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
