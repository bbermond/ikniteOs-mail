import Link from 'next/link';
import { TEMPLATES } from '@/templates';

const STEPS = [
  { n: '01', h: 'Pick a layout', p: 'Four templates, from a bold brand card to a two line footer that disappears into a thread.' },
  { n: '02', h: 'Add your details', p: 'Name, title, contact, socials. Crop a portrait right in the browser. The preview updates as you type.' },
  { n: '03', h: 'Paste it in', p: 'One button puts a formatted signature on your clipboard. Gmail, Outlook and Apple Mail all take it directly.' },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-content px-6 pb-14 pt-16">
        <p className="eyebrow">IkniteOS Mail</p>
        <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(38px,6vw,62px)] leading-[1.04] tracking-[-0.015em]">
          Email signatures your team will actually use.
        </h1>
        <p className="mt-5 max-w-[58ch] text-[16px] leading-relaxed text-muted">
          Most signature tools produce something that breaks in Outlook or squashes the photo. This one produces table based
          HTML that renders the same everywhere, and hands it to you already formatted so pasting it works the first time.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/build" className="btn inline-block">Build my signature</Link>
          <span className="text-[13px] text-muted">Free. No account. Takes about two minutes.</span>
        </div>
      </section>

      <section className="border-y border-rule bg-panel">
        <div className="mx-auto grid max-w-content gap-8 px-6 py-14 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <p className="font-mono text-[12px] tracking-wider text-[var(--accent)]">{s.n}</p>
              <h2 className="mt-2 font-display text-[21px] leading-snug">{s.h}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 py-14">
        <h2 className="font-display text-[28px] leading-tight">Four ways to sign off</h2>
        <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed text-muted">
          Every template ships with its own colourways, so a whole team can share one layout and still tell each other apart.
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <article key={t.id} className="rounded-xl border border-rule bg-panel p-5 shadow-panel">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[19px]">{t.name}</h3>
                <span className="text-[11.5px] text-faint">{t.colorways.length} colours</span>
              </div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{t.blurb}</p>
              <div className="mt-3.5 flex gap-1.5">
                {t.colorways.slice(0, 6).map((c) => (
                  <span key={c.id} className="h-5 w-5 rounded border border-black/10"
                        style={{ background: c.bg === 'transparent' ? c.rule : c.bg }}
                        title={c.name} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-rule">
        <div className="mx-auto max-w-content px-6 py-14">
          <h2 className="font-display text-[28px] leading-tight">Why signatures break, and what this does about it</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            {[
              ['Outlook ignores modern CSS', 'Everything here is tables and inline styles, the way email has always wanted it. No flexbox, no grid, no surprises.'],
              ['Pasting gives you raw code', 'The copy button puts real HTML on the clipboard, not the markup as text, so Gmail pastes a signature rather than a wall of tags.'],
              ['Photos come out squashed', 'Portraits are cropped to a true square in the browser before they are used, and the markup locks the dimensions.'],
              ['Images vanish later', 'Uploads are stored with a content hash and served with permanent cache headers, so a signature sent last year still loads.'],
            ].map(([h, p]) => (
              <div key={h}>
                <dt className="text-[14px] font-medium">{h}</dt>
                <dd className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{p}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-3 px-6 py-8 text-[13px] text-muted">
          <p>A product of <a href="https://ikniteos.com" className="text-[var(--accent)] no-underline">IkniteOS</a>.</p>
          <nav className="flex gap-5">
            <Link href="/build" className="no-underline">Builder</Link>
            <Link href="/privacy" className="no-underline">Privacy</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
