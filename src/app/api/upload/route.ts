import { NextResponse } from 'next/server';
import { MAX_UPLOAD_BYTES, extensionFor, saveImage } from '@/lib/storage';

export const runtime = 'nodejs';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

/**
 * Absolute origin for image URLs. The configured site URL wins, because those
 * URLs end up in other people's inboxes. Behind a proxy the request URL carries
 * the bind address rather than the public host, so fall back to the forwarded
 * headers before trusting it.
 */
function publicOrigin(req: Request): string {
  if (SITE) return SITE;
  const proto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'http';
  const host = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || req.headers.get('host');
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}

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
    return NextResponse.json({ url: `${publicOrigin(req)}/api/img/${id}`, id });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Upload failed. Try again.' }, { status: 500 });
  }
}
