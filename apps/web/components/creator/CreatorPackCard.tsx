'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreatorPack } from '@parel/core/hooks/useCreatorPacks';
import { Package, User } from 'lucide-react';

interface CreatorPackCardProps {
  pack: CreatorPack;
}

export function CreatorPackCard({ pack }: CreatorPackCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          {pack.title}
        </CardTitle>
        <CardDescription>
          {pack.description || 'No description provided.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{pack.type}</Badge>
          <Badge variant={pack.status === 'APPROVED' ? 'default' : pack.status === 'REJECTED' ? 'destructive' : 'secondary'}>
            {pack.status}
          </Badge>
        </div>

        {pack.creator && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>
              {pack.creator.name || pack.creator.username || 'Unknown Creator'}
            </span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Created: {new Date(pack.createdAt).toLocaleDateString()}
          {pack.approvedAt && (
            <> · Approved: {new Date(pack.approvedAt).toLocaleDateString()}</>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

