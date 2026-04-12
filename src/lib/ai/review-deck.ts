import { GoogleGenerativeAI } from '@google/generative-ai';

export async function reviewPitchDeck(deckText: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: `Review this pitch deck content:\n\n${deckText.slice(0, 8000)}` }],
      },
    ],
    systemInstruction: `You are a capital markets advisor reviewing a self-storage investment pitch deck. Analyze the text content and identify:

1. **Stale Data Points** — any statistics, market figures, or rates that may be outdated (flag anything older than 6 months)
2. **Missing Information** — key data points that investors typically expect but are absent
3. **Questionable Claims** — any projections or assertions that seem aggressive or unsupported
4. **Strengths** — what's compelling about this pitch
5. **Suggested Updates** — specific numbers or facts that should be refreshed with current data

Be direct and specific. Reference the exact data points you're flagging.`,
  });

  return result.response.text();
}
