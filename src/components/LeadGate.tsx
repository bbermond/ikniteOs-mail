'use client';

import { useState } from 'react';

export const CONSENT_TEXT =
  'I agree that IkniteOS may email me about this signature and occasional product updates. I can unsubscribe at any time.';

interface Props {
  templateId: string;
  colorwayId: string;
  onCancel: () => void;
  onUnlocked: () => void;
}

const TEAM_SIZES = ['Just me', '2 to 10', '11 to 50', '51 to 200', '200 plus'];

export default function LeadGate({ templateId, colorwayId, onCancel, onUnlocked }: Props) {
  const [form, setForm] = useState({
    fullName: '', email: '', company: '', website: '', teamSize: '', phone: '', companyFax: '',
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, consent, consentText: CONSENT_TEXT, templateId, colorwayId,
          source: 'ikniteos-mail generator',
        }),
      });
      if (res.ok) {
        try { localStorage.setItem('iko-mail-unlocked', '1'); } catch { /* private mode */ }
        onUnlocked();
        return;
      }
      const body = await res.json().catch(() => ({}));
      setErrors(body.errors ?? { email: body.error ?? 'Something went wrong. Try again.' });
    } catch {
      setErrors({ email: 'Network problem. Try again.' });
    } finally {
      setBusy(false);
    }
  }

  const field = (
    key: keyof typeof form, label: string, type = 'text',
    placeholder = '', required = false,
  ) => (
    <div>
      <label className="lbl" htmlFor={`lead-${key}`}>{label}{required ? '' : ' (optional)'}</label>
      <input
        id={`lead-${key}`} className="field" type={type} value={form[key]} placeholder={placeholder}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `err-${key}` : undefined}
      />
      {errors[key] && <p id={`err-${key}`} className="mt-1 text-[12px] text-[#C2410C]">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-4 sm:items-center"
         role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <form onSubmit={submit} className="my-8 w-full max-w-[460px] rounded-2xl bg-panel p-6 shadow-panel">
        <p className="eyebrow">One step left</p>
        <h2 id="gate-title" className="mt-1 font-display text-[24px] leading-tight">Where should we send it?</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Your signature is ready. Tell us who it is for and it unlocks straight away, no email confirmation and no waiting.
        </p>

        <div className="mt-5 grid gap-3.5">
          {field('fullName', 'Your name', 'text', 'Alex Mensah', true)}
          {field('email', 'Work email', 'email', 'alex@yourcompany.com', true)}
          {field('company', 'Company', 'text', 'Yourcompany Ltd', true)}
          {field('website', 'Website', 'text', 'yourcompany.com')}
          <div>
            <label className="lbl" htmlFor="lead-teamSize">Team size (optional)</label>
            <select id="lead-teamSize" className="field" value={form.teamSize}
                    onChange={(e) => set('teamSize', e.target.value)}>
              <option value="">Prefer not to say</option>
              {TEAM_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Honeypot, hidden from people and screen readers alike. */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
          <label htmlFor="companyFax">Fax</label>
          <input id="companyFax" tabIndex={-1} autoComplete="off" value={form.companyFax}
                 onChange={(e) => set('companyFax', e.target.value)} />
        </div>

        <div className="mt-4 flex gap-2.5">
          <input id="consent" type="checkbox" checked={consent} className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                 onChange={(e) => { setConsent(e.target.checked); setErrors((x) => ({ ...x, consent: '' })); }}
                 aria-describedby={errors.consent ? 'err-consent' : undefined} />
          <label htmlFor="consent" className="text-[12.5px] leading-relaxed text-muted">{CONSENT_TEXT}</label>
        </div>
        {errors.consent && <p id="err-consent" className="mt-1 text-[12px] text-[#C2410C]">{errors.consent}</p>}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button type="button" className="text-[13px] text-muted underline underline-offset-2" onClick={onCancel}>
            Back to editing
          </button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Unlocking…' : 'Unlock my signature'}
          </button>
        </div>
      </form>
    </div>
  );
}
