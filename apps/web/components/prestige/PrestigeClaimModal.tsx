'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, Gift, AlertTriangle } from 'lucide-react';

interface PrestigeClaimModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  prestigeCount: number;
  seasonLevel: number;
  canPrestige: boolean;
}

const PRESTIGE_LEVEL_CAP = 50;

export function PrestigeClaimModal({
  open,
  onClose,
  onConfirm,
  loading,
  prestigeCount,
  seasonLevel,
  canPrestige,
}: PrestigeClaimModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Prestige Activation
          </DialogTitle>
          <DialogDescription>
            Activate prestige to reset your season progress and unlock new rewards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!canPrestige ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Not Ready Yet
                </span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You must reach level {PRESTIGE_LEVEL_CAP} to prestige.
                Current level: {seasonLevel}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Prestige:</span>
                  <span className="font-semibold">#{prestigeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Prestige:</span>
                  <span className="font-bold text-primary">#{prestigeCount + 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Level:</span>
                  <span className="font-semibold">Level {seasonLevel}</span>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  What You'll Get:
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>Reset to Level 1 (season progress)</li>
                  <li>+1 Prestige Count</li>
                  <li>Unique Title & Color Theme</li>
                  <li>Prestige Badge</li>
                  <li>Legacy XP preserved</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ This action is irreversible. Your season progress will be reset, but your legacy XP and prestige rewards will be preserved.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading || !canPrestige}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Gift className="w-4 h-4 mr-2" />
            {loading ? 'Activating...' : 'Activate Prestige'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

