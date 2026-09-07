import {
  SOCIAL_LABELS, SANS, esc, link, prettyUrl, safeUrl, tidy,
  type Colorway, type SignatureData, type SocialKey, type Template,
} from './types';

/**
 * Classic. Portrait on the left, a coloured rule, details on the right, on the
 * mail client's own background. The safest thing to put in a reply chain and
 * the one that survives Outlook without complaint.
 */
const colorways: Colorway[] = [
  { id: 'navy',    name: 'Navy',    bg: 'transparent', fg: '#1A2D4A', rule: '#1A2D4A', btnBg: '#1A2D4A', btnFg: '#FFFFFF' },
  { id: 'blue',    name: 'Blue',    bg: 'transparent', fg: '#0C5BCD', rule: '#0C5BCD', btnBg: '#0C5BCD', btnFg: '#FFFFFF' },
  { id: 'teal',    name: 'Teal',    bg: 'transparent', fg: '#0E6B6B', rule: '#0E6B6B', btnBg: '#0E6B6B', btnFg: '#FFFFFF' },
  { id: 'crimson', name: 'Crimson', bg: 'transparent', fg: '#9B1B30', rule: '#9B1B30', btnBg: '#9B1B30', btnFg: '#FFFFFF' },
  { id: 'amber',   name: 'Amber',   bg: 'transparent', fg: '#8A5A00', rule: '#F3A41B', btnBg: '#F3A41B', btnFg: '#1A2D4A' },
  { id: 'graphite',name: 'Graphite',bg: 'transparent', fg: '#2E3F55', rule: '#8CA1B8', btnBg: '#2E3F55', btnFg: '#FFFFFF' },
];

function render(d: SignatureData, c: Colorway): string {
  const body = '#444444';
  const site = safeUrl(d.website);

  const rows: string[] = [];
  if (d.phone) rows.push(`<span style="color:#888;">T</span>&nbsp;&nbsp;${link(safeUrl(d.phone, 'tel'), d.phone, body)}`);
  if (d.mobile) rows.push(`<span style="color:#888;">M</span>&nbsp;&nbsp;${link(safeUrl(d.mobile, 'tel'), d.mobile, body)}`);
  if (d.email) rows.push(`<span style="color:#888;">E</span>&nbsp;&nbsp;${link(safeUrl(d.email, 'mailto'), d.email, c.fg)}`);
  if (site) rows.push(`<span style="color:#888;">W</span>&nbsp;&nbsp;${link(site, prettyUrl(d.website), c.fg)}`);
  if (d.address) rows.push(`<span style="color:#888;">A</span>&nbsp;&nbsp;${esc(d.address)}`);

  const socials = Object.entries(d.socials ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => link(safeUrl(String(v)), SOCIAL_LABELS[k as SocialKey] ?? k, c.fg))
    .join('<span style="color:#BBB;"> &middot; </span>');

  const photo = d.photoUrl
    ? `<td width="92" style="width:92px;padding:0 18px 0 0;vertical-align:top;">
         <img src="${esc(d.photoUrl)}" width="92" height="92" alt="${esc(d.fullName)}"
              style="display:block;width:92px;height:92px;max-width:92px;border-radius:6px;object-fit:cover;object-position:center top;border:0;outline:none;">
       </td>`
    : '';

  const logo = d.logoUrl
    ? `<div style="padding-top:12px;"><img src="${esc(d.logoUrl)}" height="30" alt="${esc(d.company)}" style="display:block;height:30px;width:auto;border:0;outline:none;"></div>`
    : '';

  const cta = d.ctaLabel && safeUrl(d.ctaUrl)
    ? `<div style="padding-top:11px;"><a href="${safeUrl(d.ctaUrl)}" style="font-family:${SANS};display:inline-block;background:${c.btnBg};color:${c.btnFg};font-size:11.5px;font-weight:bold;line-height:1;text-decoration:none;padding:9px 16px;border-radius:4px;">${esc(d.ctaLabel)}</a></div>`
    : '';

  const banner = d.bannerUrl
    ? `<tr><td colspan="4" style="padding-top:16px;">
         ${safeUrl(d.bannerLinkUrl || d.website) ? `<a href="${safeUrl(d.bannerLinkUrl || d.website)}" style="text-decoration:none;">` : ''}
         <img src="${esc(d.bannerUrl)}" width="520" alt="${esc(d.company)}" style="display:block;width:520px;max-width:100%;height:auto;border:0;outline:none;">
         ${safeUrl(d.bannerLinkUrl || d.website) ? '</a>' : ''}
       </td></tr>`
    : '';

  return tidy(`
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;font-family:${SANS};">
  <tr>
    ${photo}
    <td width="3" style="width:3px;background:${c.rule};font-size:0;line-height:0;">&nbsp;</td>
    <td style="padding:0 0 0 18px;vertical-align:top;">
      <div style="font-family:${SANS};font-size:17px;font-weight:bold;line-height:1.25;color:${c.fg};">${esc(d.fullName)}${d.pronouns ? `<span style="font-weight:normal;font-size:11px;color:#888;"> (${esc(d.pronouns)})</span>` : ''}</div>
      <div style="font-family:${SANS};font-size:13px;line-height:1.4;color:${body};padding-top:2px;">${esc(d.jobTitle)}</div>
      ${d.company ? `<div style="font-family:${SANS};font-size:13px;font-weight:bold;line-height:1.4;color:${c.fg};">${esc(d.company)}</div>` : ''}
      ${rows.length ? `<div style="font-family:${SANS};font-size:12.5px;line-height:1.75;color:${body};padding-top:9px;">${rows.join('<br>')}</div>` : ''}
      ${socials ? `<div style="font-family:${SANS};font-size:12px;line-height:1.6;padding-top:7px;">${socials}</div>` : ''}
      ${logo}
      ${cta}
    </td>
  </tr>
  ${banner}
  ${d.disclaimer ? `<tr><td colspan="4" style="padding-top:12px;font-family:${SANS};font-size:10.5px;line-height:1.45;color:#9AA6B2;">${esc(d.disclaimer)}</td></tr>` : ''}
</table>`);
}

export const classicTemplate: Template = {
  id: 'classic',
  name: 'Classic',
  blurb: 'Portrait, accent rule, labelled contact rows. Understated and bulletproof.',
  width: 560,
  capabilities: { photo: true, logo: true, banner: true, cta: true, socials: true, address: true },
  colorways,
  render,
};
