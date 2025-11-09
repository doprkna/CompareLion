'use client';

import { usePathname } from 'next/navigation';
import NavLinks from "@/components/NavLinks";
import AuthStatus from '@/app/components/AuthStatus';
import { AuthenticatedXpBar } from "@/components/AuthenticatedXpBar";

/**
 * ConditionalNav - Only renders the global navigation on appropriate pages
 * 
 * Pages with their own navigation (landing, login, signup, etc.) should not 
 * display the global nav to prevent overlapping headers.
 * 
 * v0.35.9 - Landing page has its own nav, so global nav is hidden there
 */
export function ConditionalNav() {
  const pathname = usePathname();
  
  // Pages that have their own navigation and should NOT show the global nav
  const pagesWithoutGlobalNav = [
    '/landing',  // Has its own nav built-in
    '/login', 
    '/signup',
    '/waitlist',
    '/onboarding',
    '/', // root page
  ];

  const shouldHideNav = pagesWithoutGlobalNav.some(path => pathname === path);

  if (shouldHideNav) {
    return null;
  }

  return (
    <nav className="bg-card shadow-sm border-b border-border mb-6 hidden md:block">
      <div className="flex items-center justify-between px-6 py-3">
        <NavLinks />
        <div className="flex items-center gap-4">
          <AuthenticatedXpBar />
          <AuthStatus />
        </div>
      </div>
    </nav>
  );
}
