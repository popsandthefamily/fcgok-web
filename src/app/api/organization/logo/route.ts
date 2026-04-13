import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

export async function POST(request: Request) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  if (!auth.orgSlug) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${auth.orgSlug}/logo-${Date.now()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('branding')
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from('branding').getPublicUrl(path);
  return NextResponse.json({ url: urlData.publicUrl });
}
