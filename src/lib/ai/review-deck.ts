import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function reviewPitchDeck(deckText: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: `You are a capital markets advisor reviewing a self-storage investment pitch deck. Analyze the text content and identify:

1. **Stale Data Points** — any statistics, market figures, or rates that may be outdated (flag anything older than 6 months)
2. **Missing Information** — key data points that investors typically expect but are absent
3. **Questionable Claims** — any projections or assertions that seem aggressive or unsupported
4. **Strengths** — what's compelling about this pitch
5. **Suggested Updates** — specific numbers or facts that should be refreshed with current data

Be direct and specific. Reference the exact data points you're flagging.`,
    messages: [
      {
        role: 'user',
        content: `Review this pitch deck content:\n\n${deckText.slice(0, 8000)}`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
