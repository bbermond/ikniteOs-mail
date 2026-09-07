import { NextResponse } from 'next/server';
import { MAX_UPLOAD_BYTES, extensionFor, saveImage } from '@/lib/storage';

export const runtime = 'nodejs';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? '';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file supplied.' }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'That image is larger than 2 MB. Crop it or pick a smaller one.' },
        { status: 413 },
      );
    }
    if (!extensionFor(file.type)) {
      return NextResponse.json(
        { error: 'Use a PNG, JPEG or WebP image.' },
        { status: 415 },
      );
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const id = await saveImage(bytes, file.type);
    const origin = SITE || new URL(req.url).origin;
    return NextResponse.json({ url: `${origin.replace(/\/$/, '')}/api/img/${id}`, id });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Upload failed. Try again.' }, { status: 500 });
  }
}
