import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';
import { rateLimit } from '@/lib/utils/rate-limit';

export async function POST(request: Request) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limited = rateLimit(`deck-review:${auth.id}`, 10, 60 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI features require an API key (ANTHROPIC_API_KEY or GEMINI_API_KEY).' }, { status: 503 });
  }

  const { text } = await request.json();
  if (!text) return NextResponse.json({ error: 'Deck text is required' }, { status: 400 });
  if (typeof text !== 'string' || text.length > 80_000) {
    return NextResponse.json({ error: 'Deck text is too large.' }, { status: 400 });
  }

  try {
    const { reviewPitchDeck } = await import('@/lib/ai/review-deck');
    const review = await reviewPitchDeck(text);
    return NextResponse.json({ review });
  } catch (err) {
    console.error('Deck review error:', err);
    const message = err instanceof Error ? err.message : 'Failed to review deck.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
