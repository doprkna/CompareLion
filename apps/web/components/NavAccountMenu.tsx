'use client';

import { useSession } from 'next-auth/react';
import { signOutToPath } from '@/lib/auth/signOutClient';
import Link from 'next/link';
import { ChevronDown, LogOut, User, Bell, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationBell from '@/app/components/NotificationBell';

export function NavAccountMenu() {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  if (status === 'loading') {
    return <div className="h-8 w-20 animate-pulse rounded bg-border/60" aria-hidden />;
  }

  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  const displayName =
    session.user.name || session.user.email?.split('@')[0] || 'Account';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    toast({
      title: 'Logging out…',
      description: 'See you soon!',
    });
    setTimeout(() => {
      void signOutToPath('/');
    }, 300);
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <NotificationBell />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 text-sm text-text hover:bg-accent/10 transition-colors">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent"
            aria-hidden
          >
            {initials}
          </span>
          <span className="max-w-[120px] truncate hidden lg:inline">{displayName}</span>
          <ChevronDown className="h-4 w-4 text-subtle shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card border-border w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium text-text truncate">{displayName}</p>
            {session.user.email ? (
              <p className="text-xs text-subtle truncate">{session.user.email}</p>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/settings" className="cursor-pointer flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/notifications" className="cursor-pointer flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2"
            onSelect={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
