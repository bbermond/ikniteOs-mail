import {
  SOCIAL_LABELS, SANS, SERIF, esc, link, prettyUrl, safeUrl, tidy,
  type Colorway, type SignatureData, type SocialKey, type Template,
} from './types';

/**
 * Card. A filled, rounded panel holding a round portrait, the person's details
 * and an optional full width brand strip beneath. This is the layout NewU
 * Hydration Lounge uses and the reason this product exists.
 */
const colorways: Colorway[] = [
  { id: 'ink',    name: 'Deep Ink',   bg: '#1A2D4A', fg: '#FFFFFF', rule: 'rgba(255,255,255,.32)', btnBg: '#F3A41B', btnFg: '#1A2D4A', dark: true },
  { id: 'blue',   name: 'Brand Blue', bg: '#0C5BCD', fg: '#FFFFFF', rule: 'rgba(255,255,255,.38)', btnBg: '#F3A41B', btnFg: '#1A2D4A', dark: true },
  { id: 'sky',    name: 'Sky',        bg: '#C0D4E7', fg: '#0C5BCD', rule: 'rgba(12,91,205,.28)',   btnBg: '#F3A41B', btnFg: '#1A2D4A' },
  { id: 'sage',   name: 'Sage',       bg: '#E6F4C5', fg: '#0C5BCD', rule: 'rgba(12,91,205,.28)',   btnBg: '#F3A41B', btnFg: '#1A2D4A' },
  { id: 'sand',   name: 'Sand',       bg: '#FFECCC', fg: '#0C5BCD', rule: 'rgba(12,91,205,.28)',   btnBg: '#0C5BCD', btnFg: '#FFFFFF' },
  { id: 'mist',   name: 'Mist',       bg: '#E8EEF3', fg: '#1A2D4A', rule: 'rgba(26,45,74,.22)',    btnBg: '#1A2D4A', btnFg: '#FFFFFF' },
  { id: 'forest', name: 'Forest',     bg: '#123A2E', fg: '#FFFFFF', rule: 'rgba(255,255,255,.30)', btnBg: '#94BD4C', btnFg: '#123A2E', dark: true },
  { id: 'plum',   name: 'Plum',       bg: '#3B1D46', fg: '#FFFFFF', rule: 'rgba(255,255,255,.30)', btnBg: '#E8B4F0', btnFg: '#3B1D46', dark: true },
];

function render(d: SignatureData, c: Colorway): string {
  const site = safeUrl(d.website);
  const W = 600;
  const inner = W - 28;

  const photo = d.photoUrl
    ? `<td width="78" style="width:78px;padding:0 16px 0 0;vertical-align:middle;">
         <img src="${esc(d.photoUrl)}" width="78" height="78" alt="${esc(d.fullName)}"
              style="display:block;width:78px;height:78px;max-width:78px;border-radius:50%;object-fit:cover;object-position:center top;border:0;outline:none;">
       </td>`
    : '';

  const contactLines: string[] = [];
  if (d.address) contactLines.push(esc(d.address));
  if (d.phone) contactLines.push(`<span style="font-weight:bold;">${link(safeUrl(d.phone, 'tel'), d.phone, c.fg, true)}</span>`);
  if (d.mobile) contactLines.push(link(safeUrl(d.mobile, 'tel'), d.mobile, c.fg));

  const linkLines: string[] = [];
  if (d.email) linkLines.push(link(safeUrl(d.email, 'mailto'), d.email, c.fg));
  if (site) linkLines.push(link(site, prettyUrl(d.website), c.fg));

  const socials = Object.entries(d.socials ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => link(safeUrl(String(v)), SOCIAL_LABELS[k as SocialKey] ?? k, c.fg))
    .join(`<span style="opacity:.5;"> &middot; </span>`);

  const cta = d.ctaLabel && safeUrl(d.ctaUrl)
    ? `<div style="padding-top:9px;">
         <a href="${safeUrl(d.ctaUrl)}" style="font-family:${SANS};display:inline-block;background:${c.btnBg};color:${c.btnFg};font-size:11.5px;font-weight:bold;line-height:1;text-decoration:none;padding:9px 16px;border-radius:9999px;">${esc(d.ctaLabel)}</a>
       </div>`
    : '';

  const banner = d.bannerUrl
    ? `<tr><td style="padding:0 14px 14px 14px;">
         ${safeUrl(d.bannerLinkUrl || d.website) ? `<a href="${safeUrl(d.bannerLinkUrl || d.website)}" style="text-decoration:none;">` : ''}
           <img src="${esc(d.bannerUrl)}" width="${inner}" alt="${esc(d.company)}"
                style="display:block;width:${inner}px;max-width:100%;height:auto;border:0;outline:none;">
         ${safeUrl(d.bannerLinkUrl || d.website) ? '</a>' : ''}
       </td></tr>`
    : '';

  const disclaimer = d.disclaimer
    ? `<tr><td style="padding:10px 14px 0 14px;font-family:${SANS};font-size:10.5px;line-height:1.45;color:${c.fg};opacity:.65;">${esc(d.disclaimer)}</td></tr>`
    : '';

  return tidy(`
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:separate;width:${W}px;max-width:${W}px;background:${c.bg};border-radius:16px;">
  <tr><td style="padding:14px 14px 10px 14px;">
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;width:100%;"><tr>
      ${photo}
      <td style="vertical-align:middle;padding:0 14px 0 0;">
        <div style="font-family:${SERIF};font-size:23px;line-height:1.15;color:${c.fg};">${esc(d.fullName)}${d.pronouns ? `<span style="font-family:${SANS};font-size:11px;opacity:.7;"> (${esc(d.pronouns)})</span>` : ''}</div>
        <div style="font-family:${SANS};font-size:13px;line-height:1.35;color:${c.fg};opacity:.92;padding-top:3px;">${esc(d.jobTitle)}${d.jobTitle && d.company ? '<span style="opacity:.55;"> | </span>' : ''}${esc(d.company)}</div>
      </td>
      <td width="1" style="width:1px;background:${c.rule};font-size:0;line-height:0;">&nbsp;</td>
      <td width="250" style="width:250px;padding:0 0 0 16px;vertical-align:middle;">
        ${contactLines.length ? `<div style="font-family:${SANS};font-size:12.5px;line-height:1.45;color:${c.fg};">${contactLines.join('<br>')}</div>` : ''}
        ${linkLines.length ? `<div style="font-family:${SANS};font-size:12.5px;line-height:1.5;padding-top:6px;">${linkLines.join('<br>')}</div>` : ''}
        ${socials ? `<div style="font-family:${SANS};font-size:11.5px;line-height:1.5;padding-top:6px;color:${c.fg};">${socials}</div>` : ''}
        ${cta}
      </td>
    </tr></table>
  </td></tr>
  ${banner}
  ${disclaimer}
</table>`);
}

export const cardTemplate: Template = {
  id: 'card',
  name: 'Card',
  blurb: 'Filled panel with a round portrait and a full width brand strip. Bold in a thread.',
  width: 600,
  capabilities: { photo: true, logo: false, banner: true, cta: true, socials: true, address: true },
  colorways,
  render,
};
