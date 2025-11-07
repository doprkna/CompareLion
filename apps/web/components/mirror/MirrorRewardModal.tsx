'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles } from 'lucide-react';

interface MirrorRewardModalProps {
  open: boolean;
  onClose: () => void;
  rewards: {
    xp: number;
    badgeGranted?: boolean;
    badgeName?: string;
  };
  message?: string;
}

export function MirrorRewardModal({ open, onClose, rewards, message }: MirrorRewardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Reflection Submitted!
          </DialogTitle>
          <DialogDescription>
            {message || 'Your reflection has been recorded'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">XP Earned:</span>
              <span className="text-lg font-bold text-primary">+{rewards.xp}</span>
            </div>
            {rewards.badgeGranted && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Badge Unlocked:
                </span>
                <span className="text-sm font-semibold">{rewards.badgeName || 'Event Badge'}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

