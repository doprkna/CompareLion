'use client';

import { useSession } from 'next-auth/react';
import FooterLocaleToggle from '@/components/FooterLocaleToggle';

/** Footer locale controls for guests only; signed-in users use Profile → Settings. */
export function FooterLocaleSection() {
  const { status } = useSession();
  if (status === 'authenticated') return null;
  return <FooterLocaleToggle />;
}
