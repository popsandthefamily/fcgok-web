// Unified AI provider — tries Anthropic → Groq → Gemini in order

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

async function tryGroq(system: string, userMessage: string, maxTokens: number): Promise<string> {
  const Groq = (await import('groq-sdk')).default;
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMessage },
    ],
  });
  return response.choices[0]?.message?.content ?? '';
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

export type ProviderPreference = 'quality' | 'speed';

export async function generateText(
  system: string,
  userMessage: string,
  maxTokens = 2048,
  preference: ProviderPreference = 'quality',
): Promise<string> {
  const all = [
    { name: 'Anthropic', available: !!process.env.ANTHROPIC_API_KEY, fn: () => tryAnthropic(system, userMessage, maxTokens) },
    { name: 'Groq', available: !!process.env.GROQ_API_KEY, fn: () => tryGroq(system, userMessage, maxTokens) },
    { name: 'Gemini', available: !!process.env.GEMINI_API_KEY, fn: () => tryGemini(system, userMessage) },
  ];

  // "speed" prefers Groq first (Llama 3.3 70B, ~5s), then falls back to Anthropic/Gemini
  const order = preference === 'speed'
    ? ['Groq', 'Anthropic', 'Gemini']
    : ['Anthropic', 'Groq', 'Gemini'];

  const providers = order
    .map((name) => all.find((p) => p.name === name)!)
    .filter((p) => p.available);

  if (providers.length === 0) {
    throw new Error('No AI provider configured (ANTHROPIC_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY)');
  }

  let lastError: Error | null = null;
  for (const provider of providers) {
    try {
      return await provider.fn();
    } catch (err) {
      console.warn(`${provider.name} failed, trying next:`, err instanceof Error ? err.message : err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error('All AI providers failed');
}
