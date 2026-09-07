import type { MetadataRoute } from 'next';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mail.ikniteos.com').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const built = new Date();
  return [
    { url: `${SITE}/`, lastModified: built, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE}/build`, lastModified: built, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/privacy`, lastModified: built, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
