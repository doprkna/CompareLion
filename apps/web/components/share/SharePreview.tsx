'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SharePreviewProps {
  shareCard: {
    id: string;
    type: string;
    imageUrl?: string | null;
    caption?: string | null;
    shareUrl: string;
  };
  loading?: boolean;
}

export function SharePreview({ shareCard, loading }: SharePreviewProps) {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Generating share card...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Share Card Preview</CardTitle>
        <CardDescription>Your shareable card</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {shareCard.imageUrl && (
          <div className="bg-muted rounded-lg p-4 border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shareCard.imageUrl}
              alt={shareCard.caption || 'Share card'}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        {shareCard.caption && (
          <div className="bg-muted rounded-lg p-3 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Caption:</p>
            <p className="text-sm font-semibold">{shareCard.caption}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Share URL: <span className="font-mono">{shareCard.shareUrl}</span>
        </div>
      </CardContent>
    </Card>
  );
}

