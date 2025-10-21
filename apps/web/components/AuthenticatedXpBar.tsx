'use client';

import { useSession } from 'next-auth/react';
import { XpBar } from './XpBar';

// Wrapper component to conditionally render XpBar only for authenticated users
export function AuthenticatedXpBar() {
  const { data: session, status } = useSession();
  
  // Don't render XpBar for unauthenticated users
  if (status === 'loading' || !session?.user) {
    return null;
  }
  
  return <XpBar variant="header" />;
}








