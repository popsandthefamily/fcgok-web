import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reviewPitchDeck } from '@/lib/ai/review-deck';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text } = await request.json();
  if (!text) return NextResponse.json({ error: 'Deck text is required' }, { status: 400 });

  const review = await reviewPitchDeck(text);
  return NextResponse.json({ review });
}
