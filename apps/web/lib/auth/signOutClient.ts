'use client';

import { signOut } from 'next-auth/react';

/**
 * Sign out without redirecting to NEXTAUTH_URL (which may differ from the dev port).
 * NextAuth resolves relative callbackUrl against NEXTAUTH_URL, not window.location.
 */
export async function signOutToPath(path = '/'): Promise<void> {
  const target = path.startsWith('/') ? path : `/${path}`;
  await signOut({ redirect: false });
  if (typeof window !== 'undefined') {
    window.location.assign(target);
  }
}
