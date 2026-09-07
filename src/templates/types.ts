export type SocialKey = 'linkedin' | 'instagram' | 'x' | 'facebook' | 'youtube' | 'tiktok';

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  x: 'X',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

/** Everything a signature can display. Templates use what they need and ignore the rest. */
export interface SignatureData {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  website: string;
  photoUrl: string;
  logoUrl: string;
  bannerUrl: string;
  bannerLinkUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  pronouns: string;
  disclaimer: string;
  socials: Partial<Record<SocialKey, string>>;
}

export interface Colorway {
  id: string;
  name: string;
  /** Panel or accent bar background. */
  bg: string;
  /** Primary text on that background. */
  fg: string;
  /** Hairline rules and dividers. */
  rule: string;
  /** Call to action pill. */
  btnBg: string;
  btnFg: string;
  /** True when bg is dark, so the UI can render the swatch label legibly. */
  dark?: boolean;
}

/** Feature flags so the editor only shows fields a template actually renders. */
export interface TemplateCapabilities {
  photo: boolean;
  logo: boolean;
  banner: boolean;
  cta: boolean;
  socials: boolean;
  address: boolean;
}

export interface RenderOptions {
  /**
   * Preview swaps hosted URLs for local object URLs or data URLs so the editor
   * shows an image the moment it is cropped, before it has been uploaded.
   */
  preview?: boolean;
}

export interface Template {
  id: string;
  name: string;
  blurb: string;
  /** Roughly how wide the rendered signature is, for layout hints. */
  width: number;
  capabilities: TemplateCapabilities;
  colorways: Colorway[];
  render: (data: SignatureData, colorway: Colorway, opts?: RenderOptions) => string;
}

/* ---------- shared helpers ---------- */

export const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
export const SERIF = "Georgia,'Times New Roman',serif";

/** Escape user input before it goes anywhere near generated markup. */
export function esc(value: string): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
}

/** Only allow schemes that are safe to put in an href inside an email. */
export function safeUrl(raw: string, scheme: 'http' | 'mailto' | 'tel' = 'http'): string {
  const v = String(raw ?? '').trim();
  if (!v) return '';
  if (scheme === 'mailto') return `mailto:${esc(v)}`;
  if (scheme === 'tel') return `tel:${esc(v.replace(/[^\d+]/g, ''))}`;
  if (/^https?:\/\//i.test(v)) return esc(v);
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(v)) return `https://${esc(v)}`;
  return '';
}

/** Strip the scheme so a link reads as a domain rather than a URL. */
export function prettyUrl(raw: string): string {
  return esc(String(raw ?? '').trim().replace(/^https?:\/\//i, '').replace(/\/$/, ''));
}

export function link(href: string, text: string, color: string, bold = false): string {
  if (!href) return esc(text);
  return `<a href="${href}" style="color:${color};text-decoration:none;${bold ? 'font-weight:bold;' : ''}">${esc(text)}</a>`;
}

/** Collapse the whitespace templates use for readability. Email clients render it as gaps. */
export function tidy(html: string): string {
  return html.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
}
