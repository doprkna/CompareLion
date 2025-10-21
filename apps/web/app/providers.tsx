'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes';
import { useRealtime } from '@/hooks/useRealtime';
import { usePresence } from '@/hooks/usePresence';

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
      <SessionProvider>
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}





