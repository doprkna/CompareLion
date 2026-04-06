'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Gem, Store, List } from 'lucide-react';

export default function CommercePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const links = [
    { href: '/coinshop', label: 'Coin Shop', desc: 'Spend gold on items and gear', icon: ShoppingBag },
    { href: '/diamondshop', label: 'Diamond Shop', desc: 'Premium diamonds, WIP', icon: Gem },
    { href: '/marketplace', label: 'Marketplace', desc: 'Player-driven market', icon: Store },
    { href: '/profile/market', label: 'My Listings', desc: 'Manage your marketplace listings', icon: List },
  ];

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Commerce</h1>
          <p className="text-subtle">Buy, sell, and manage your items</p>
        </div>
        <div className="grid gap-4">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="bg-card border-2 border-border hover:border-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Icon className="h-8 w-8 text-accent" />
                      <div>
                        <CardTitle className="text-lg">{item.label}</CardTitle>
                        <p className="text-sm text-subtle">{item.desc}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
