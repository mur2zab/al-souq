import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Al-Souq (السوق) | Visual Commerce & High-Trust Community Classifieds',
  description:
    'Visual Commerce & High-Trust Classifieds Platform for the Dawoodi Bohra Community. Discover fresh Bohra Thaali pop-ups, designer ridas, and NoBroker masjid-proximate rentals with verified ITS identity.',
  keywords: [
    'Dawoodi Bohra',
    'Al-Souq',
    'Bohra Classifieds',
    'Mazgaon Flats',
    'NoBroker Bohra',
    'Rida Fashion',
    'Bohra Thaali Catering',
    'ITS Verification',
  ],
  authors: [{ name: 'Al-Souq Platform Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#09332A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-slate-800 antialiased selection:bg-gold-500/30 selection:text-emerald-950 font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
