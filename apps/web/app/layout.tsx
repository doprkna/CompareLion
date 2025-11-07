import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import NavLinks from "@/components/NavLinks";
import AuthStatus from './components/AuthStatus';
import Footer from './components/Footer';
import EnvStamp from "@/components/EnvStamp";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteProgress } from "@/components/RouteProgress";
import { DevBar } from "@/components/DevBar";
import MusicToggle from '@/components/MusicToggle';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from 'sonner';
import { ThemeProvider } from "@/components/ThemeProvider";
import { XpProvider } from "@/components/XpProvider";
import { AuthenticatedXpBar } from "@/components/AuthenticatedXpBar";
import { StagingBanner } from "@/components/StagingBanner";
import { APP_NAME, APP_DESCRIPTION } from '@/lib/config';
import { PWAProvider } from '@/components/PWAProvider';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { MobileNav } from '@/components/MobileNav';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';
import MiniPlayer from '@/components/media/MiniPlayer';
import { LocaleProvider, useLocale } from '@/lib/i18n/useLocale';
import FooterLocaleToggle from '@/components/FooterLocaleToggle';
import LocaleHeaderChip from '@/components/LocaleHeaderChip';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://parel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${APP_NAME} - Compare, Discover, Level Up`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  generator: `Next.js v0.13.2p`,
  keywords: ['gamification', 'polling', 'self-discovery', 'comparison', 'questions', 'community', 'leaderboard'],
  authors: [{ name: 'PareL Team' }],
  creator: 'PareL',
  publisher: 'PareL',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: `${APP_NAME} - Compare, Discover, Level Up`,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - Social polling and gamified self-discovery`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} - Compare, Discover, Level Up`,
    description: APP_DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@PareL_App',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-bg text-text transition-colors duration-300`}>
        <Providers>
          <LocaleProvider>
          <ThemeProvider>
            <XpProvider>
              <PWAProvider>
                <MusicPlayerProvider>
                  <ErrorBoundary>
                    <LocaleHeaderChip />
                    <StagingBanner />
                    <RouteProgress />
                    <MobileNav />
                    <nav className="bg-card shadow-sm border-b border-border mb-6 hidden md:block">
                      <div className="flex items-center justify-between px-6 py-3">
                        <NavLinks />
                        <div className="flex items-center gap-4">
                          <AuthenticatedXpBar />
                          <AuthStatus />
                        </div>
                      </div>
                    </nav>
                    {children}
                    <EnvStamp />
                    <div className="border-t">
                      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                        <Footer />
                        <FooterLocaleToggle />
                      </div>
                    </div>
                    <DevBar />
                    <MusicToggle />
                    <MiniPlayer />
                    <PWAInstallPrompt />
                    <Toaster />
                    <SonnerToaster />
                  </ErrorBoundary>
                </MusicPlayerProvider>
              </PWAProvider>
            </XpProvider>
          </ThemeProvider>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}

