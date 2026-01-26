'use client';

import { useDiscoveryIndex, Discovery } from '@parel/core/hooks/useDiscoveryIndex';
import { Loader2, Sparkles, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DiscoveryList() {
  const { discoveries, loading, error, total } = useDiscoveryIndex();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-lg p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Discovery Index</h2>
        <span className="text-sm text-muted-foreground">({total} discovered)</span>
      </div>

      {discoveries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No discoveries yet. Craft items to discover them!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discoveries.map((discovery) => (
            <DiscoveryCard key={discovery.id} discovery={discovery} />
          ))}
        </div>
      )}
    </div>
  );
}

function DiscoveryCard({ discovery }: { discovery: Discovery }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {discovery.item.emoji && <span>{discovery.item.emoji}</span>}
          <Package className="w-5 h-5 text-primary" />
          {discovery.item.name}
        </CardTitle>
        <CardDescription>
          {discovery.item.description || 'No description available.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{discovery.item.type}</Badge>
          <Badge variant="secondary" className="capitalize">{discovery.item.rarity}</Badge>
          {discovery.item.category && (
            <Badge variant="outline">{discovery.item.category}</Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Discovered: {new Date(discovery.discoveredAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}

