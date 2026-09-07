import {
  SOCIAL_LABELS, SANS, SERIF, esc, link, prettyUrl, safeUrl, tidy,
  type Colorway, type SignatureData, type SocialKey, type Template,
} from './types';

/**
 * Masthead. A coloured bar carries the name and title, details sit underneath
 * on the mail background. Reads like a letterhead and gives a logo real room.
 */
const colorways: Colorway[] = [
  { id: 'ink',     name: 'Deep Ink',  bg: '#1A2D4A', fg: '#FFFFFF', rule: '#E2E8F0', btnBg: '#F3A41B', btnFg: '#1A2D4A', dark: true },
  { id: 'blue',    name: 'Blue',      bg: '#0C5BCD', fg: '#FFFFFF', rule: '#DCE6F7', btnBg: '#F3A41B', btnFg: '#1A2D4A', dark: true },
  { id: 'forest',  name: 'Forest',    bg: '#123A2E', fg: '#FFFFFF', rule: '#DCE9E2', btnBg: '#94BD4C', btnFg: '#123A2E', dark: true },
  { id: 'crimson', name: 'Crimson',   bg: '#7A1226', fg: '#FFFFFF', rule: '#F0DCE0', btnBg: '#F3A41B', btnFg: '#7A1226', dark: true },
  { id: 'stone',   name: 'Stone',     bg: '#EFE9E1', fg: '#3B332A', rule: '#E4DCD2', btnBg: '#3B332A', btnFg: '#FFFFFF' },
  { id: 'plum',    name: 'Plum',      bg: '#3B1D46', fg: '#FFFFFF', rule: '#EADCEF', btnBg: '#E8B4F0', btnFg: '#3B1D46', dark: true },
];

function render(d: SignatureData, c: Colorway): string {
  const body = '#54606E';
  const site = safeUrl(d.website);
  const W = 560;
  const dot = '<span style="color:#C3CBD4;"> &middot; </span>';

  const contact = [
    d.phone ? link(safeUrl(d.phone, 'tel'), d.phone, body) : '',
    d.mobile ? link(safeUrl(d.mobile, 'tel'), d.mobile, body) : '',
    d.email ? link(safeUrl(d.email, 'mailto'), d.email, c.bg === '#EFE9E1' ? '#3B332A' : c.bg) : '',
  ].filter(Boolean).join(dot);

  const second = [
    site ? link(site, prettyUrl(d.website), c.bg === '#EFE9E1' ? '#3B332A' : c.bg) : '',
    d.address ? esc(d.address) : '',
  ].filter(Boolean).join(dot);

  const socials = Object.entries(d.socials ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => link(safeUrl(String(v)), SOCIAL_LABELS[k as SocialKey] ?? k, c.bg === '#EFE9E1' ? '#3B332A' : c.bg))
    .join(dot);

  const photo = d.photoUrl
    ? `<td width="58" style="width:58px;padding:0 14px 0 0;vertical-align:middle;">
         <img src="${esc(d.photoUrl)}" width="58" height="58" alt="${esc(d.fullName)}"
              style="display:block;width:58px;height:58px;max-width:58px;border-radius:50%;object-fit:cover;object-position:center top;border:0;outline:none;">
       </td>`
    : '';

  const cta = d.ctaLabel && safeUrl(d.ctaUrl)
    ? `<div style="padding-top:10px;"><a href="${safeUrl(d.ctaUrl)}" style="font-family:${SANS};display:inline-block;background:${c.btnBg};color:${c.btnFg};font-size:11.5px;font-weight:bold;line-height:1;text-decoration:none;padding:9px 16px;border-radius:3px;">${esc(d.ctaLabel)}</a></div>`
    : '';

  return tidy(`
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;width:${W}px;max-width:${W}px;font-family:${SANS};">
  <tr><td style="background:${c.bg};padding:13px 18px;">
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;width:100%;"><tr>
      ${photo}
      <td style="vertical-align:middle;">
        <div style="font-family:${SERIF};font-size:20px;line-height:1.2;color:${c.fg};">${esc(d.fullName)}${d.pronouns ? `<span style="font-family:${SANS};font-size:11px;opacity:.75;"> (${esc(d.pronouns)})</span>` : ''}</div>
        <div style="font-family:${SANS};font-size:12.5px;line-height:1.4;color:${c.fg};opacity:.9;padding-top:2px;">${esc(d.jobTitle)}${d.jobTitle && d.company ? '<span style="opacity:.6;"> | </span>' : ''}${esc(d.company)}</div>
      </td>
      ${d.logoUrl ? `<td width="86" style="width:86px;text-align:right;vertical-align:middle;"><img src="${esc(d.logoUrl)}" width="86" alt="${esc(d.company)}" style="display:block;width:86px;height:auto;border:0;outline:none;margin-left:auto;"></td>` : ''}
    </tr></table>
  </td></tr>
  <tr><td style="padding:11px 18px 0 18px;border-left:1px solid ${c.rule};border-right:1px solid ${c.rule};border-bottom:1px solid ${c.rule};">
    ${contact ? `<div style="font-family:${SANS};font-size:12.5px;line-height:1.65;color:${body};">${contact}</div>` : ''}
    ${second ? `<div style="font-family:${SANS};font-size:12.5px;line-height:1.65;color:${body};">${second}</div>` : ''}
    ${socials ? `<div style="font-family:${SANS};font-size:12px;line-height:1.6;padding-top:4px;">${socials}</div>` : ''}
    ${cta}
    <div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div>
  </td></tr>
  ${d.bannerUrl ? `<tr><td style="padding-top:12px;">${safeUrl(d.bannerLinkUrl || d.website) ? `<a href="${safeUrl(d.bannerLinkUrl || d.website)}" style="text-decoration:none;">` : ''}<img src="${esc(d.bannerUrl)}" width="${W}" alt="${esc(d.company)}" style="display:block;width:${W}px;max-width:100%;height:auto;border:0;outline:none;">${safeUrl(d.bannerLinkUrl || d.website) ? '</a>' : ''}</td></tr>` : ''}
  ${d.disclaimer ? `<tr><td style="padding-top:10px;font-family:${SANS};font-size:10.5px;line-height:1.45;color:#9AA6B2;">${esc(d.disclaimer)}</td></tr>` : ''}
</table>`);
}

export const mastheadTemplate: Template = {
  id: 'masthead',
  name: 'Masthead',
  blurb: 'Coloured header bar over bordered details. Letterhead energy, logo gets room.',
  width: 560,
  capabilities: { photo: true, logo: true, banner: true, cta: true, socials: true, address: true },
  colorways,
  render,
};
