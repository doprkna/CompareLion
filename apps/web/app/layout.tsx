import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import NavLinks from '../components/NavLinks';
import AuthStatus from './components/AuthStatus';
import Footer from './components/Footer';
import EnvStamp from '../components/EnvStamp';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { RouteProgress } from '../components/RouteProgress';
import { DevBar } from '../components/DevBar';
import MusicToggle from '@/components/MusicToggle';
import { Toaster } from '../components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { ThemeProvider } from '../components/ThemeProvider';
import { XpProvider } from '../components/XpProvider';
import { AuthenticatedXpBar } from '../components/AuthenticatedXpBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PareL - Task Routing Platform',
  description: 'Route tasks to automation or human VAs',
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
          <ThemeProvider>
            <XpProvider>
              <ErrorBoundary>
                <RouteProgress />
                <nav className="bg-card shadow-sm border-b border-border mb-6">
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
                <Footer />
                <DevBar />
                <MusicToggle />
                <Toaster />
                <SonnerToaster />
              </ErrorBoundary>
            </XpProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}





