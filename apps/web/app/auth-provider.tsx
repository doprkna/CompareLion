"use client";

import { SessionProvider } from "next-auth/react";

/** @deprecated Use SessionProvider from providers.tsx directly. */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}




