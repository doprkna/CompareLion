'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Gift } from 'lucide-react';

interface WildcardModalProps {
  open: boolean;
  onClose: () => void;
  onRedeem: () => void;
  wildcard: {
    id: string;
    wildcardId: string;
    title: string;
    description: string;
    flavorText: string;
    rewardXP: number;
    rewardKarma: number;
  };
  loading?: boolean;
}

export function WildcardModal({ open, onClose, onRedeem, wildcard, loading }: WildcardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-500" />
            🎲 Wildcard Triggered!
          </DialogTitle>
          <DialogDescription>{wildcard.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted rounded-lg p-4 border border-border">
            <div className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              {wildcard.title}
            </div>
            <div className="text-sm text-muted-foreground mb-3">{wildcard.flavorText}</div>
          </div>

          <div className="bg-muted rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">XP Reward:</span>
              <span className="text-sm font-semibold text-primary">+{wildcard.rewardXP}</span>
            </div>
            {wildcard.rewardKarma > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Karma Reward:</span>
                <span className="text-sm font-semibold text-green-500">+{wildcard.rewardKarma}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Later
          </Button>
          <Button
            onClick={onRedeem}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Gift className="w-4 h-4 mr-2" />
            {loading ? 'Claiming...' : 'Claim Rewards'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

