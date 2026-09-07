import { NextResponse } from 'next/server';
import { readImage } from '@/lib/storage';

export const runtime = 'nodejs';

/**
 * Signatures live in other people's mailboxes for years, so these responses are
 * immutable and cached hard. The filename is a content hash, so a changed image
 * is always a new URL.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const found = await readImage(id);
  if (!found) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(new Uint8Array(found.bytes), {
    headers: {
      'Content-Type': found.mime,
      'Content-Length': String(found.bytes.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
