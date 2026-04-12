import { generateText } from './provider';

export async function generateMarketSnapshot(location: string, recentIntel: string[]): Promise<string> {
  const context = recentIntel.length
    ? `\n\nRecent intelligence from this area:\n${recentIntel.join('\n')}`
    : '';

  return generateText(
    `You are a commercial real estate market analyst specializing in self-storage. Generate a concise market snapshot for investor pitch materials. Include:

1. **Market Overview** — population, growth trends, economic drivers
2. **Self-Storage Supply** — estimated existing supply, new development pipeline
3. **Demand Indicators** — population growth, household formation, business activity
4. **Competitive Landscape** — major operators, recent transactions
5. **Investment Thesis** — why this market is attractive (or not) for self-storage development

Use specific numbers where possible. Be analytical, not promotional. Flag any risks.`,
    `Generate a market snapshot for: ${location}${context}`,
  );
}
