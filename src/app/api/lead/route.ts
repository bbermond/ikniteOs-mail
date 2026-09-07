import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { sendToGhl, validateLead } from '@/lib/leads';

export const runtime = 'nodejs';

const LOG_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), '.uploads');

/** Crude in-memory throttle. Enough to stop a bored script, not a botnet. */
const hits = new Map<string, { n: number; until: number }>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.until) {
    hits.set(ip, { n: 1, until: now + 60_000 });
    return false;
  }
  rec.n += 1;
  return rec.n > 8;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (throttled(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Wait a minute.' }, { status: 429 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  // Honeypot. Real people leave it empty.
  if (typeof payload.companyFax === 'string' && payload.companyFax.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const result = validateLead(payload);
  if (!result.ok || !result.clean) {
    return NextResponse.json({ errors: result.errors }, { status: 422 });
  }

  const record = {
    ...result.clean,
    consentText: String(payload.consentText ?? ''),
    receivedAt: new Date().toISOString(),
    ip,
    userAgent: req.headers.get('user-agent') ?? '',
  };

  const ghl = await sendToGhl(result.clean);

  // Always keep our own copy, so a CRM outage never loses a lead.
  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(
      path.join(LOG_DIR, 'leads.ndjson'),
      `${JSON.stringify({ ...record, ghlDelivered: ghl.delivered, ghlReason: ghl.reason })}\n`,
      'utf8',
    );
  } catch (err) {
    console.error('[lead] local write failed', err);
  }

  if (!ghl.delivered) console.warn('[lead] not delivered to GHL:', ghl.reason);

  // The person gets their signature regardless of what the CRM did.
  return NextResponse.json({ ok: true });
}
