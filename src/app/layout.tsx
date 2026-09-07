import type { Metadata } from 'next';
import './globals.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mail.ikniteos.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'IkniteOS Mail — Email signatures your whole team will actually use',
    template: '%s — IkniteOS Mail',
  },
  description:
    'Build a branded email signature in a couple of minutes. Pick a template, crop your photo, choose a colour, and paste it into Gmail, Outlook or Apple Mail. Free.',
  openGraph: {
    title: 'IkniteOS Mail',
    description: 'Branded email signatures in a couple of minutes. Free.',
    url: SITE,
    siteName: 'IkniteOS Mail',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
