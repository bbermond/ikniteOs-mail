export const metadata = { title: 'Privacy' };

export default function Privacy() {
  return (
    <main className="mx-auto max-w-[68ch] px-6 py-16">
      <p className="eyebrow">IkniteOS Mail</p>
      <h1 className="mt-2 font-display text-[34px] leading-tight">Privacy</h1>
      <p className="mt-4 text-[14px] leading-relaxed text-muted">Last updated 7 September 2026.</p>

      {[
        ['What we collect', 'When you unlock a signature we collect the name, work email, company, and optionally website and team size that you type into that form, along with the template you chose and the time you gave consent. We also keep the IP address and browser string of that request, which we use for rate limiting and abuse handling.'],
        ['What we do with it', 'We email you about the signature you built and occasional IkniteOS product updates. Your details go into our CRM so we can do that. We do not sell them and we do not share them with advertisers.'],
        ['Images you upload', 'Photos, logos and banners are cropped in your browser and then stored on our server so email clients can load them. Anyone holding the link can view the image, so treat an uploaded file as public. Ask us and we will delete it.'],
        ['The signature itself', 'Your signature is generated in your browser. We do not keep a copy of the finished markup.'],
        ['Getting out', 'Every email we send carries an unsubscribe link. You can also write to us and ask for your record to be deleted, and we will remove it from the CRM and our logs.'],
      ].map(([h, p]) => (
        <section key={h} className="mt-8">
          <h2 className="font-display text-[21px]">{h}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">{p}</p>
        </section>
      ))}

      <p className="mt-10 text-[14px] leading-relaxed text-muted">
        Questions go to <a href="mailto:hello@ikniteos.com" className="text-[var(--accent)]">hello@ikniteos.com</a>.
      </p>
    </main>
  );
}
