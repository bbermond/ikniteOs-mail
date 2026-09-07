import { cardTemplate } from './card';
import { classicTemplate } from './classic';
import { compactTemplate } from './compact';
import { mastheadTemplate } from './masthead';
import type { SignatureData, Template } from './types';

export const TEMPLATES: Template[] = [cardTemplate, classicTemplate, mastheadTemplate, compactTemplate];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export const EMPTY_SIGNATURE: SignatureData = {
  fullName: '', jobTitle: '', company: '', email: '', phone: '', mobile: '',
  address: '', website: '', photoUrl: '', logoUrl: '', bannerUrl: '', bannerLinkUrl: '',
  ctaLabel: '', ctaUrl: '', pronouns: '', disclaimer: '', socials: {},
};

/** What a first-time visitor sees, so the editor is never an empty shell. */
export const SAMPLE_SIGNATURE: SignatureData = {
  fullName: 'Bermond Yange',
  jobTitle: 'Business Developer',
  company: 'IkniteOS',
  email: 'you@yourcompany.com',
  phone: '(408) 317-4897',
  mobile: '',
  address: 'San Jose, California',
  website: 'ikniteos.com',
  photoUrl: '',
  logoUrl: '',
  bannerUrl: '',
  bannerLinkUrl: '',
  ctaLabel: 'Book a call',
  ctaUrl: 'https://ikniteos.com',
  pronouns: '',
  disclaimer: '',
  socials: { linkedin: 'linkedin.com/in/yourname' },
};

export * from './types';
