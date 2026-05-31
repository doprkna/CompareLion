'use client';
import { useSession } from 'next-auth/react';
import { signOutToPath } from '@/lib/auth/signOutClient';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth/isAdmin';
import NotificationBell from './NotificationBell';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [languages] = useState([
    { code: 'en', name: 'English' },
    { code: 'cs', name: 'Čeština' },
  ]);
  const [selectedLang, setSelectedLang] = useState('en');
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleLogout = () => {
    toast({
      title: "👋 Logging out...",
      description: "See you soon, adventurer!",
    });
    setTimeout(() => {
      void signOutToPath('/');
    }, 500);
  };

  const username =
    session?.user?.name ||
    session?.user?.email?.split('@')[0] ||
    'Guest';

  // Fetch user role from database
  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/me`)
        .then(r => r.json())
        .then(data => {
          if (data.user?.role) {
            setUserRole(data.user.role);
          }
        })
        .catch(() => {});
    }
  }, [session?.user?.email]);

  return (
    <div className="flex items-center gap-3 text-sm text-subtle">
      <select
        className="bg-card border border-border rounded px-2 py-1 text-sm text-text"
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>{l.name}</option>
        ))}
      </select>
      {status === 'authenticated' && <NotificationBell />}
      {status === 'authenticated' && (
        <span className="text-text">Logged in as {username}</span>
      )}
      {status === 'authenticated' &&
        (isAdmin(session?.user) || isAdmin(userRole ? { role: userRole } : null)) && (
        <>
          <Link 
            href="/admin"
            className="px-2 py-1 bg-destructive text-white text-xs font-bold rounded hover:opacity-90 transition"
          >
            ADMIN
          </Link>
          <Link 
            href="/reports"
            className="px-2 py-1 bg-accent text-white text-xs font-bold rounded hover:opacity-90 transition"
          >
            REPORTS
          </Link>
        </>
      )}
      {status === 'authenticated' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-text hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      )}
    </div>
  );
}
