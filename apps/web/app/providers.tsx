'use client'

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { useRealtime } from '@parel/core/hooks/useRealtime';
import { usePresence } from '@parel/core/hooks/usePresence';
import { ensureUnifiedConfigInitialized } from '@parel/core/config/unified';

function UnifiedConfigBoot() {
  useEffect(() => {
    if (typeof ensureUnifiedConfigInitialized === 'function') {
      ensureUnifiedConfigInitialized();
    } else {
      console.warn('[UnifiedConfig] ensureUnifiedConfigInitialized missing from @parel/core');
    }
  }, []);
  return null;
}

if (typeof ensureUnifiedConfigInitialized === 'function') {
  ensureUnifiedConfigInitialized();
} else {
  console.warn('[UnifiedConfig] ensureUnifiedConfigInitialized missing from @parel/core');
}

const VisitLogger = dynamic(() => import('@/components/VisitLogger').then((m) => m.VisitLogger), { ssr: false });

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
        <VisitLogger />
        <UnifiedConfigBoot />
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
