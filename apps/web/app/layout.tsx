import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Link from 'next/link';
import { routes } from './routes';
import AuthStatus from './components/AuthStatus';
import Footer from './components/Footer';
import EnvStamp from '../components/EnvStamp';
import { ErrorBoundary } from '../components/ErrorBoundary';

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
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <nav className="bg-white shadow mb-6">
            <div className="flex items-center px-6 py-3">
              <ul className="flex flex-wrap gap-4">
                {routes.map((route) => (
                  <li key={route.path}>
                    <Link href={route.path} className="text-gray-700 hover:text-blue-600 font-medium transition">
                      {route.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <AuthStatus />
            </div>
          </nav>
          <Providers>{children}</Providers>
          <EnvStamp />
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}





