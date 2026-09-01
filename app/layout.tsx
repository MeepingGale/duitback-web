import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import './ds.css';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-archivo',
  display: 'swap',
});

const SITE = 'https://meepinggale.github.io/duitback-web';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'DuitBack — Malaysian Tax Relief Tracker',
    template: '%s · DuitBack',
  },
  description:
    'Track Malaysian income tax relief claims against the real LHDN caps all year — receipts in one vault, a live refund estimate, and a filing-pack cheat-sheet for MyTax e-Filing. Free and private: everything stays in your browser.',
  keywords: [
    'Malaysia income tax',
    'tax relief tracker',
    'LHDN relief caps',
    'pelepasan cukai',
    'e-Filing MyTax',
    'Form BE',
    'tax refund Malaysia',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'DuitBack',
    title: 'DuitBack — Malaysian Tax Relief Tracker',
    description:
      'Log relief claims as you spend, watch every LHDN cap, and file from a one-page cheat-sheet when e-Filing opens. Local-first — your tax data never leaves your browser.',
    images: [{ url: '/og.png', width: 2880, height: 1920, alt: 'DuitBack dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DuitBack — Malaysian Tax Relief Tracker',
    description:
      'Track relief claims against real LHDN caps all year, file from a cheat-sheet in March. Free, private, browser-only.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: 'icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
