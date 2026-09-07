import {
  SOCIAL_LABELS, SANS, esc, link, prettyUrl, safeUrl, tidy,
  type Colorway, type SignatureData, type SocialKey, type Template,
} from './types';

/**
 * Compact. One name line, one contact line, a hairline rule. No portrait.
 * For people who reply forty times a day and do not want a poster under
 * every message.
 */
const colorways: Colorway[] = [
  { id: 'navy',     name: 'Navy',     bg: 'transparent', fg: '#1A2D4A', rule: '#DDE4EC', btnBg: '#1A2D4A', btnFg: '#FFFFFF' },
  { id: 'blue',     name: 'Blue',     bg: 'transparent', fg: '#0C5BCD', rule: '#D6E2F6', btnBg: '#0C5BCD', btnFg: '#FFFFFF' },
  { id: 'graphite', name: 'Graphite', bg: 'transparent', fg: '#2E3F55', rule: '#E1E6EC', btnBg: '#2E3F55', btnFg: '#FFFFFF' },
  { id: 'teal',     name: 'Teal',     bg: 'transparent', fg: '#0E6B6B', rule: '#D2E6E6', btnBg: '#0E6B6B', btnFg: '#FFFFFF' },
  { id: 'crimson',  name: 'Crimson',  bg: 'transparent', fg: '#9B1B30', rule: '#F0D8DC', btnBg: '#9B1B30', btnFg: '#FFFFFF' },
];

function render(d: SignatureData, c: Colorway): string {
  const body = '#5A6675';
  const site = safeUrl(d.website);
  const dot = '<span style="color:#C3CBD4;"> &middot; </span>';

  const contact = [
    d.phone ? link(safeUrl(d.phone, 'tel'), d.phone, body) : '',
    d.email ? link(safeUrl(d.email, 'mailto'), d.email, c.fg) : '',
    site ? link(site, prettyUrl(d.website), c.fg) : '',
  ].filter(Boolean).join(dot);

  const socials = Object.entries(d.socials ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => link(safeUrl(String(v)), SOCIAL_LABELS[k as SocialKey] ?? k, c.fg))
    .join(dot);

  const logo = d.logoUrl
    ? `<td width="40" style="width:40px;padding:0 14px 0 0;vertical-align:middle;">
         <img src="${esc(d.logoUrl)}" width="40" alt="${esc(d.company)}" style="display:block;width:40px;height:auto;border:0;outline:none;">
       </td>`
    : '';

  const cta = d.ctaLabel && safeUrl(d.ctaUrl)
    ? `${dot}<a href="${safeUrl(d.ctaUrl)}" style="color:${c.fg};font-weight:bold;text-decoration:none;">${esc(d.ctaLabel)}</a>`
    : '';

  return tidy(`
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;font-family:${SANS};max-width:560px;">
  <tr><td style="border-top:2px solid ${c.rule};padding-top:11px;">
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;"><tr>
      ${logo}
      <td style="vertical-align:middle;">
        <div style="font-family:${SANS};font-size:14px;line-height:1.4;color:${c.fg};">
          <span style="font-weight:bold;">${esc(d.fullName)}</span>${d.pronouns ? `<span style="font-size:11px;color:#8A96A3;font-weight:normal;"> (${esc(d.pronouns)})</span>` : ''}${d.jobTitle ? `<span style="color:${body};font-weight:normal;">, ${esc(d.jobTitle)}</span>` : ''}${d.company ? `<span style="color:${body};font-weight:normal;"> at ${esc(d.company)}</span>` : ''}
        </div>
        ${contact || cta ? `<div style="font-family:${SANS};font-size:12.5px;line-height:1.6;color:${body};padding-top:4px;">${contact}${cta}</div>` : ''}
        ${socials ? `<div style="font-family:${SANS};font-size:12px;line-height:1.6;padding-top:3px;">${socials}</div>` : ''}
        ${d.address ? `<div style="font-family:${SANS};font-size:11.5px;line-height:1.5;color:#8A96A3;padding-top:3px;">${esc(d.address)}</div>` : ''}
      </td>
    </tr></table>
  </td></tr>
  ${d.bannerUrl ? `<tr><td style="padding-top:12px;">${safeUrl(d.bannerLinkUrl || d.website) ? `<a href="${safeUrl(d.bannerLinkUrl || d.website)}" style="text-decoration:none;">` : ''}<img src="${esc(d.bannerUrl)}" width="520" alt="${esc(d.company)}" style="display:block;width:520px;max-width:100%;height:auto;border:0;outline:none;">${safeUrl(d.bannerLinkUrl || d.website) ? '</a>' : ''}</td></tr>` : ''}
  ${d.disclaimer ? `<tr><td style="padding-top:10px;font-family:${SANS};font-size:10.5px;line-height:1.45;color:#9AA6B2;">${esc(d.disclaimer)}</td></tr>` : ''}
</table>`);
}

export const compactTemplate: Template = {
  id: 'compact',
  name: 'Compact',
  blurb: 'Two tidy lines under a hairline. Barely there in a long thread.',
  width: 560,
  capabilities: { photo: false, logo: true, banner: true, cta: true, socials: true, address: true },
  colorways,
  render,
};
