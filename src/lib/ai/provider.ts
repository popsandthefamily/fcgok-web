// Unified AI provider — Anthropic primary, Gemini fallback on error

async function tryAnthropic(system: string, userMessage: string, maxTokens: number): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

async function tryGemini(system: string, userMessage: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    systemInstruction: system,
  });
  return result.response.text();
}

export async function generateText(
  system: string,
  userMessage: string,
  maxTokens = 2048,
): Promise<string> {
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (!hasAnthropic && !hasGemini) {
    throw new Error('No AI provider configured');
  }

  // Try Anthropic first if available
  if (hasAnthropic) {
    try {
      return await tryAnthropic(system, userMessage, maxTokens);
    } catch (err) {
      console.warn('Anthropic failed, falling back to Gemini:', err instanceof Error ? err.message : err);
      if (!hasGemini) throw err;
    }
  }

  // Fall back to Gemini (or use it as primary if no Anthropic)
  if (hasGemini) {
    return tryGemini(system, userMessage);
  }

  throw new Error('All AI providers failed');
}
