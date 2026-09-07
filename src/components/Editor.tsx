'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import LeadGate from './LeadGate';
import PhotoCropper from './PhotoCropper';
import { copyPlain, copyRichHtml } from '@/lib/clipboard';
import { SAMPLE_SIGNATURE, TEMPLATES, getTemplate } from '@/templates';
import type { SignatureData, SocialKey } from '@/templates';
import { SOCIAL_LABELS } from '@/templates/types';

type ImageSlot = 'photoUrl' | 'logoUrl' | 'bannerUrl';

const SOCIAL_KEYS: SocialKey[] = ['linkedin', 'instagram', 'x', 'facebook', 'youtube', 'tiktok'];

export default function Editor() {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const template = getTemplate(templateId);
  const [colorwayId, setColorwayId] = useState(template.colorways[0].id);
  const [data, setData] = useState<SignatureData>(SAMPLE_SIGNATURE);
  const [unlocked, setUnlocked] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [cropping, setCropping] = useState<{ file: File; slot: ImageSlot } | null>(null);
  const [uploading, setUploading] = useState<ImageSlot | null>(null);
  const [notice, setNotice] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const colorway = useMemo(
    () => template.colorways.find((c) => c.id === colorwayId) ?? template.colorways[0],
    [template, colorwayId],
  );

  // Keep the colourway valid when switching template.
  useEffect(() => {
    if (!template.colorways.some((c) => c.id === colorwayId)) {
      setColorwayId(template.colorways[0].id);
    }
  }, [template, colorwayId]);

  useEffect(() => {
    try { if (localStorage.getItem('iko-mail-unlocked') === '1') setUnlocked(true); } catch { /* ignore */ }
  }, []);

  const html = useMemo(
    () => template.render(data, colorway),
    [template, data, colorway],
  );

  function set<K extends keyof SignatureData>(key: K, value: SignatureData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function pickFile(slot: ImageSlot) {
    fileInputs.current[slot]?.click();
  }

  function onFile(slot: ImageSlot, file: File | undefined) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setNotice('That image is very large. Pick one under 8 MB.');
      return;
    }
    if (slot === 'photoUrl') setCropping({ file, slot });
    else void upload(file, slot);
  }

  async function upload(blob: Blob, slot: ImageSlot, previewUrl?: string) {
    setUploading(slot);
    // Show the crop immediately, swap in the hosted URL when it lands.
    if (previewUrl) set(slot, previewUrl);
    try {
      const body = new FormData();
      body.append('file', blob, slot === 'photoUrl' ? 'photo.png' : 'image.png');
      const res = await fetch('/api/upload', { method: 'POST', body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      set(slot, json.url);
      setNotice('');
    } catch (err) {
      setNotice(
        err instanceof Error
          ? `${err.message} Your signature still works here, but the image will not load for other people until the upload succeeds.`
          : 'Upload failed.',
      );
    } finally {
      setUploading(null);
    }
  }

  async function onCopyRich() {
    if (!unlocked) { setShowGate(true); return; }
    const ok = await copyRichHtml(html);
    setNotice(ok ? 'Copied. Paste it into your signature settings.' : 'Copy failed. Use the source button instead.');
  }

  async function onCopySource() {
    if (!unlocked) { setShowGate(true); return; }
    const ok = await copyPlain(html);
    setNotice(ok ? 'Source copied. Paste it into a code or source view.' : 'Copy failed.');
  }

  const cap = template.capabilities;

  const text = (
    key: keyof SignatureData, label: string, placeholder = '', type = 'text',
  ) => (
    <div>
      <label className="lbl" htmlFor={`f-${key}`}>{label}</label>
      <input id={`f-${key}`} className="field" type={type} placeholder={placeholder}
             value={String(data[key] ?? '')}
             onChange={(e) => set(key, e.target.value as never)} />
    </div>
  );

  return (
    <div className="mx-auto max-w-content px-6 pb-24 pt-8">
      <header className="mb-7 border-b border-rule pb-5">
        <p className="eyebrow">IkniteOS Mail</p>
        <h1 className="mt-1.5 font-display text-[32px] leading-tight">Signature builder</h1>
        <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-muted">
          Pick a template, fill in your details, crop a photo. Everything updates as you type. When it looks right, copy it into Gmail, Outlook or Apple Mail.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* ---------- controls ---------- */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="rounded-xl border border-rule bg-panel p-5 shadow-panel">
            <p className="eyebrow mb-3">Template</p>
            <div className="grid gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.id} type="button" onClick={() => setTemplateId(t.id)}
                        aria-pressed={t.id === templateId}
                        className={`rounded-lg border p-3 text-left transition ${
                          t.id === templateId
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                            : 'border-[var(--field-rule)] hover:border-[var(--accent)]'
                        }`}>
                  <span className="block text-[13.5px] font-medium">{t.name}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted">{t.blurb}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-rule bg-panel p-5 shadow-panel">
            <p className="eyebrow mb-3">Colour</p>
            <div className="grid grid-cols-4 gap-2">
              {template.colorways.map((c) => (
                <button key={c.id} type="button" onClick={() => setColorwayId(c.id)}
                        aria-pressed={c.id === colorway.id} title={c.name}
                        className={`rounded-lg border p-1.5 ${
                          c.id === colorway.id ? 'border-[var(--accent)] ring-2 ring-[var(--accent-soft)]' : 'border-[var(--field-rule)]'
                        }`}>
                  <span className="block h-7 rounded"
                        style={{ background: c.bg === 'transparent' ? c.rule : c.bg,
                                 border: '1px solid rgba(22,40,63,.12)' }} />
                  <span className="mt-1 block truncate text-[10.5px] text-muted">{c.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-rule bg-panel p-5 shadow-panel">
            <p className="eyebrow mb-3">You</p>
            <div className="grid gap-3">
              {text('fullName', 'Full name', 'Alex Mensah')}
              {text('jobTitle', 'Job title', 'Head of Partnerships')}
              {text('company', 'Company', 'Yourcompany Ltd')}
              {text('email', 'Email', 'alex@yourcompany.com', 'email')}
              {text('phone', 'Phone', '(408) 555 0134', 'tel')}
              {text('website', 'Website', 'yourcompany.com')}
              {cap.address && text('address', 'Address or city', 'San Jose, California')}
            </div>
          </section>

          {(cap.photo || cap.logo || cap.banner) && (
            <section className="rounded-xl border border-rule bg-panel p-5 shadow-panel">
              <p className="eyebrow mb-3">Images</p>
              <div className="grid gap-3">
                {cap.photo && (
                  <ImageRow
                    label="Portrait" hint="Cropped to a circle. Drag to reposition."
                    value={data.photoUrl} busy={uploading === 'photoUrl'}
                    onPick={() => pickFile('photoUrl')} onClear={() => set('photoUrl', '')} round
                  />
                )}
                {cap.logo && (
                  <ImageRow
                    label="Logo" hint="PNG with a transparent background works best."
                    value={data.logoUrl} busy={uploading === 'logoUrl'}
                    onPick={() => pickFile('logoUrl')} onClear={() => set('logoUrl', '')}
                  />
                )}
                {cap.banner && (
                  <ImageRow
                    label="Banner strip" hint="A wide image, roughly 6 to 1. Sits under the details."
                    value={data.bannerUrl} busy={uploading === 'bannerUrl'}
                    onPick={() => pickFile('bannerUrl')} onClear={() => set('bannerUrl', '')} wide
                  />
                )}
              </div>
              {(['photoUrl', 'logoUrl', 'bannerUrl'] as ImageSlot[]).map((slot) => (
                <input key={slot} type="file" accept="image/png,image/jpeg,image/webp" hidden
                       ref={(el) => { fileInputs.current[slot] = el; }}
                       onChange={(e) => { onFile(slot, e.target.files?.[0]); e.target.value = ''; }} />
              ))}
            </section>
          )}

          {cap.cta && (
            <section className="rounded-xl border border-rule bg-panel p-5 shadow-panel">
              <p className="eyebrow mb-3">Call to action</p>
              <div className="grid gap-3">
                {text('ctaLabel', 'Button text', 'Book a call')}
                {text('ctaUrl', 'Button link', 'calendly.com/you/30min')}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-rule bg-panel p-5 shadow-panel">
            <button type="button" className="eyebrow flex w-full items-center justify-between"
                    onClick={() => setShowAdvanced((v) => !v)} aria-expanded={showAdvanced}>
              <span>More fields</span><span aria-hidden="true">{showAdvanced ? '−' : '+'}</span>
            </button>
            {showAdvanced && (
              <div className="mt-4 grid gap-3">
                {text('mobile', 'Mobile', '(408) 555 0199', 'tel')}
                {text('pronouns', 'Pronouns', 'she/her')}
                {cap.socials && SOCIAL_KEYS.map((k) => (
                  <div key={k}>
                    <label className="lbl" htmlFor={`s-${k}`}>{SOCIAL_LABELS[k]}</label>
                    <input id={`s-${k}`} className="field" placeholder={`${k}.com/yourname`}
                           value={data.socials?.[k] ?? ''}
                           onChange={(e) => set('socials', { ...data.socials, [k]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label className="lbl" htmlFor="f-disclaimer">Legal footer</label>
                  <textarea id="f-disclaimer" className="field" rows={3}
                            placeholder="This email and any attachments are confidential."
                            value={data.disclaimer}
                            onChange={(e) => set('disclaimer', e.target.value)} />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ---------- preview ---------- */}
        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
          <section className="rounded-xl border border-rule bg-panel p-6 shadow-panel">
            <p className="eyebrow mb-4">Preview</p>
            <div className="overflow-x-auto rounded-lg bg-white p-5">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-faint">
              Shown on white, which is what most mail clients use behind a signature.
            </p>
          </section>

          <section className="rounded-xl border border-rule bg-panel p-5 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13.5px] font-medium">{unlocked ? 'Ready to install' : 'Ready when you are'}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {unlocked ? 'Copy signature for Gmail and Outlook. Copy source for code views.' : 'Tell us where to send it and the copy buttons unlock.'}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost" onClick={onCopySource}>Copy source</button>
                <button type="button" className="btn" onClick={onCopyRich}>
                  {unlocked ? 'Copy signature' : 'Get my signature'}
                </button>
              </div>
            </div>
            {notice && <p role="status" className="mt-3 rounded-md bg-[var(--accent-soft)] px-3 py-2 text-[12.5px] text-ink">{notice}</p>}
          </section>

          <section className="rounded-xl border border-rule bg-panel p-5 shadow-panel">
            <p className="eyebrow mb-3">Installing it</p>
            <ol className="grid list-decimal gap-2 pl-5 text-[13px] leading-relaxed text-muted marker:text-faint">
              <li><b className="font-medium text-ink">Gmail.</b> Copy signature, then Settings, See all settings, Signature, and paste. Do not use Insert image, the pictures are already linked.</li>
              <li><b className="font-medium text-ink">Outlook.</b> Copy signature, then File, Options, Mail, Signatures, and paste. Outlook on the web is under Settings, Mail, Compose and reply.</li>
              <li><b className="font-medium text-ink">Apple Mail.</b> Copy signature, open Settings, Signatures, and paste. Untick Always match my default message font first.</li>
              <li><b className="font-medium text-ink">Anything with a code view.</b> Use Copy source instead.</li>
              <li>Send yourself a test and open it on a phone before rolling it out.</li>
            </ol>
          </section>
        </div>
      </div>

      {cropping && (
        <PhotoCropper
          file={cropping.file} circular
          onCancel={() => setCropping(null)}
          onDone={(blob, previewUrl) => { setCropping(null); void upload(blob, 'photoUrl', previewUrl); }}
        />
      )}

      {showGate && (
        <LeadGate
          templateId={templateId} colorwayId={colorway.id}
          onCancel={() => setShowGate(false)}
          onUnlocked={async () => {
            setShowGate(false);
            setUnlocked(true);
            const ok = await copyRichHtml(html);
            setNotice(ok ? 'Unlocked and copied. Paste it into your signature settings.' : 'Unlocked. Press Copy signature.');
          }}
        />
      )}
    </div>
  );
}

function ImageRow(props: {
  label: string; hint: string; value: string; busy: boolean; round?: boolean; wide?: boolean;
  onPick: () => void; onClear: () => void;
}) {
  const { label, hint, value, busy, round, wide, onPick, onClear } = props;
  return (
    <div className="flex items-center gap-3">
      <div className={`flex shrink-0 items-center justify-center overflow-hidden border border-[var(--field-rule)] bg-[var(--rule-soft)] ${
        wide ? 'h-11 w-[86px] rounded-md' : round ? 'h-12 w-12 rounded-full' : 'h-12 w-12 rounded-md'
      }`}>
        {value
          ? <img src={value} alt="" className="h-full w-full object-cover" />
          : <span className="text-[10px] text-faint">none</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium">{label}</p>
        <p className="truncate text-[11.5px] text-muted">{busy ? 'Uploading…' : hint}</p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <button type="button" onClick={onPick} disabled={busy}
                className="rounded-md border border-[var(--field-rule)] px-2.5 py-1.5 text-[12px] text-ink disabled:opacity-50">
          {value ? 'Change' : 'Upload'}
        </button>
        {value && (
          <button type="button" onClick={onClear}
                  className="rounded-md border border-[var(--field-rule)] px-2.5 py-1.5 text-[12px] text-muted">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
