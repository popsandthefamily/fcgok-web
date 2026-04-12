import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateMarketSnapshot(
  location: string,
  recentIntel: string[],
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const context = recentIntel.length
    ? `\n\nRecent intelligence from this area:\n${recentIntel.join('\n')}`
    : '';

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: `Generate a market snapshot for: ${location}${context}` }],
      },
    ],
    systemInstruction: `You are a commercial real estate market analyst specializing in self-storage. Generate a concise market snapshot for investor pitch materials. Include:

1. **Market Overview** — population, growth trends, economic drivers
2. **Self-Storage Supply** — estimated existing supply, new development pipeline
3. **Demand Indicators** — population growth, household formation, business activity
4. **Competitive Landscape** — major operators, recent transactions
5. **Investment Thesis** — why this market is attractive (or not) for self-storage development

Use specific numbers where possible. Be analytical, not promotional. Flag any risks.`,
  });

  return result.response.text();
}
