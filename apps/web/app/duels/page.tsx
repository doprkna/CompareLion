'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DuelCard } from '@/components/social/DuelCard';
import { useDuels, useStartDuel } from '@/hooks/useSocial';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sword, Loader2, Plus } from 'lucide-react';

export default function DuelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  // Note: This requires a GET /api/social/duels endpoint which we'll create
  const { duels, loading, error, reload } = useDuels();
  const { startDuel, loading: starting } = useStartDuel();

  // Filter duels
  const filteredDuels = filter === 'all' 
    ? duels 
    : duels.filter(d => d.status === filter);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-subtle" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-2">
          <Sword className="w-8 h-8" />
          Duels
        </h1>
        <p className="text-subtle">Challenge friends to quick competitions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-card border-red-500/20 mb-6">
          <CardContent className="p-4">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Duels Grid */}
      {filteredDuels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDuels.map((duel) => (
            <DuelCard
              key={duel.id}
              duel={duel}
              currentUserId={session?.user?.email ? undefined : undefined} // Would need to get user ID
            />
          ))}
        </div>
      )}

      {/* No Duels */}
      {filteredDuels.length === 0 && !loading && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Sword className="w-12 h-12 mx-auto mb-4 text-subtle" />
            <h3 className="text-xl font-semibold text-text mb-2">No Duels</h3>
            <p className="text-subtle mb-4">Start a duel with a friend to compete!</p>
            <Button variant="outline" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Start Duel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}




