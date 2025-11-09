'use client'

import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
import { useRealtime } from '@/hooks/useRealtime';
import { usePresence } from '@/hooks/usePresence';

// Dynamic import of AuthProvider to prevent server-side next-auth/react issues
const AuthProvider = dynamic(() => import('./auth-provider'), { ssr: false });

function RealtimeProvider({ children }: { children: React.ReactNode }) {
  // Establish real-time SSE connection
  useRealtime();
  
  // Send presence heartbeats
  usePresence();
  
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}