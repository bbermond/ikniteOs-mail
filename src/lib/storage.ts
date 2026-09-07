import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Images are written to a directory on disk. On Railway that should be a
 * persistent volume, otherwise uploads vanish on every deploy and every
 * signature in the wild breaks. UPLOAD_DIR is the mount point.
 */
const DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), '.uploads');

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export function extensionFor(mime: string): string | null {
  return EXT[mime] ?? null;
}

export async function saveImage(bytes: Buffer, mime: string): Promise<string> {
  const ext = extensionFor(mime);
  if (!ext) throw new Error(`unsupported type: ${mime}`);
  await mkdir(DIR, { recursive: true });
  // Content hash means re-uploading the same crop reuses one file.
  const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 24);
  const id = `${digest}.${ext}`;
  const dest = path.join(DIR, id);
  try {
    await stat(dest);
  } catch {
    await writeFile(dest, bytes);
  }
  return id;
}

export async function readImage(id: string): Promise<{ bytes: Buffer; mime: string } | null> {
  // Reject anything that could climb out of the upload directory.
  if (!/^[a-f0-9]{24}\.(png|jpg|webp)$/.test(id)) return null;
  const ext = id.split('.').pop() as string;
  const mime = Object.entries(EXT).find(([, e]) => e === ext)?.[0];
  if (!mime) return null;
  try {
    const bytes = await readFile(path.join(DIR, id));
    return { bytes, mime };
  } catch {
    return null;
  }
}

export function newRequestId(): string {
  return randomUUID();
}
