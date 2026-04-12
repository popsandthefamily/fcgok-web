import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI features require ANTHROPIC_API_KEY to be configured.' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text } = await request.json();
  if (!text) return NextResponse.json({ error: 'Deck text is required' }, { status: 400 });

  try {
    const { reviewPitchDeck } = await import('@/lib/ai/review-deck');
    const review = await reviewPitchDeck(text);
    return NextResponse.json({ review });
  } catch (err) {
    console.error('Deck review error:', err);
    return NextResponse.json({ error: 'Failed to review deck. Please try again.' }, { status: 500 });
  }
}
