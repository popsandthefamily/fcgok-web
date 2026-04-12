import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI features require GEMINI_API_KEY to be configured.' }, { status: 503 });
  }

  const { text } = await request.json();
  if (!text) return NextResponse.json({ error: 'Deck text is required' }, { status: 400 });

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
