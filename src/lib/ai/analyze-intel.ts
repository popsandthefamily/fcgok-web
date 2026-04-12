import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIAnalysis } from '@/lib/types';

const ANALYSIS_SYSTEM_PROMPT = `You are an analyst for a capital introduction and real estate development consulting firm focused on self-storage. Your client base consists of developers and operators who are actively seeking equity investors and debt for ground-up self-storage development projects.

Analyze the following content and return a JSON object with:

1. "summary": 2-3 sentence executive summary focused on actionable takeaways
2. "relevance_score": 0.0 to 1.0 (how relevant is this to a self-storage developer seeking capital?)
3. "category": one of "market_intel" | "investor_activity" | "deal_flow" | "regulatory" | "competitive" | "operational"
4. "entities": { "companies": [], "people": [], "locations": [], "dollar_amounts": [], "cap_rates": [], "fund_names": [] }
5. "tags": array of lowercase tags (e.g., "construction-lending", "1031-exchange", "class-a", "climate-controlled")
6. "sentiment": "bullish" | "bearish" | "neutral" | "mixed"
7. "action_items": array of 0-3 specific actions the client could take based on this intel (e.g., "Research BSC Group as potential debt arranger for Sherman TX project")
8. "investor_signals": array of any signals that a person or entity mentioned might be actively deploying capital or seeking deals

Return ONLY valid JSON, no markdown fences.`;

export async function analyzeIntelItem(item: {
  title: string;
  body: string | null;
  source: string;
  author?: string | null;
}): Promise<AIAnalysis> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const content = [
    `Source: ${item.source}`,
    item.author ? `Author: ${item.author}` : null,
    `Title: ${item.title}`,
    item.body ? `Content:\n${item.body.slice(0, 4000)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: content }] }],
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
  });

  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as AIAnalysis;
}
