'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const VIEW = 320;   // on screen crop window, square
const OUTPUT = 480; // exported pixels, 2x the largest place a photo is used

interface Props {
  file: File;
  circular: boolean;
  onCancel: () => void;
  onDone: (blob: Blob, previewUrl: string) => void;
}

/**
 * Square crop with drag to pan and a zoom slider. Everything happens on a
 * canvas in the browser, so the original photo never leaves the machine unless
 * the person exports.
 */
export default function PhotoCropper({ file, circular, onCancel, onDone }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const dragging = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load the file into an Image once.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  /** Scale that makes the image exactly cover the square window. */
  const baseScale = img ? Math.max(VIEW / img.width, VIEW / img.height) : 1;

  /** Keep the image covering the window whatever the zoom and pan. */
  const clamp = useCallback(
    (next: { x: number; y: number }, z: number) => {
      if (!img) return next;
      const w = img.width * baseScale * z;
      const h = img.height * baseScale * z;
      const maxX = Math.max(0, (w - VIEW) / 2);
      const maxY = Math.max(0, (h - VIEW) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [img, baseScale],
  );

  // Paint the preview.
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !img) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = VIEW * dpr;
    cv.height = VIEW * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, VIEW, VIEW);
    const w = img.width * baseScale * zoom;
    const h = img.height * baseScale * zoom;
    ctx.drawImage(img, (VIEW - w) / 2 + offset.x, (VIEW - h) / 2 + offset.y, w, h);
  }, [img, zoom, offset, baseScale]);

  useEffect(() => {
    setOffset((o) => clamp(o, zoom));
  }, [zoom, clamp]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    setOffset(clamp({ x: e.clientX - dragging.current.x, y: e.clientY - dragging.current.y }, zoom));
  }
  function onPointerUp() {
    dragging.current = null;
  }

  function nudge(dx: number, dy: number) {
    setOffset((o) => clamp({ x: o.x + dx, y: o.y + dy }, zoom));
  }

  async function apply() {
    if (!img) return;
    setBusy(true);
    try {
      const out = document.createElement('canvas');
      out.width = OUTPUT;
      out.height = OUTPUT;
      const ctx = out.getContext('2d');
      if (!ctx) throw new Error('canvas unavailable');
      const k = OUTPUT / VIEW;
      if (circular) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }
      const w = img.width * baseScale * zoom * k;
      const h = img.height * baseScale * zoom * k;
      ctx.drawImage(img, (OUTPUT - w) / 2 + offset.x * k, (OUTPUT - h) / 2 + offset.y * k, w, h);
      if (circular) ctx.restore();

      const blob: Blob | null = await new Promise((res) =>
        // PNG keeps the transparent corners a circular crop needs.
        out.toBlob((b) => res(b), circular ? 'image/png' : 'image/jpeg', 0.9),
      );
      if (!blob) throw new Error('export failed');
      onDone(blob, out.toDataURL(circular ? 'image/png' : 'image/jpeg', 0.9));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Crop your photo">
      <div className="w-full max-w-[420px] rounded-2xl bg-panel p-6 shadow-panel">
        <h2 className="font-display text-[22px] leading-tight">Crop your photo</h2>
        <p className="mt-1 text-[13px] text-muted">Drag to reposition, slide to zoom. Signatures use a square, so this decides what gets kept.</p>

        <div
          className="relative mx-auto mt-5 cursor-grab touch-none overflow-hidden rounded-xl bg-[var(--rule-soft)] active:cursor-grabbing"
          style={{ width: VIEW, height: VIEW }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <canvas ref={canvasRef} style={{ width: VIEW, height: VIEW }} aria-label="Photo preview" />
          {circular && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: `0 0 0 ${VIEW}px rgba(0,0,0,.45)`, borderRadius: '50%' }}
            />
          )}
        </div>

        <div className="mt-4">
          <label className="lbl" htmlFor="zoom">Zoom</label>
          <input
            id="zoom" type="range" min={1} max={4} step={0.01} value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>

        <div className="mt-2 flex justify-center gap-1.5" aria-label="Nudge photo">
          {([['←', -12, 0], ['↑', 0, -12], ['↓', 0, 12], ['→', 12, 0]] as const).map(([label, dx, dy]) => (
            <button key={label} type="button" onClick={() => nudge(dx, dy)}
              className="h-8 w-8 rounded-md border border-[var(--field-rule)] text-[13px] text-muted hover:text-ink"
              aria-label={`Nudge ${label}`}>{label}</button>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn" onClick={apply} disabled={!img || busy}>
            {busy ? 'Working…' : 'Use this crop'}
          </button>
        </div>
      </div>
    </div>
  );
}
