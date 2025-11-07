'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface PrestigeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  seasonLevel: number;
  prestigeCount: number;
}

const PRESTIGE_LEVEL_CAP = 50;

export function PrestigeModal({
  open,
  onClose,
  onConfirm,
  loading,
  seasonLevel,
  prestigeCount,
}: PrestigeModalProps) {
  const canPrestige = seasonLevel >= PRESTIGE_LEVEL_CAP;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Prestige Confirmation
          </DialogTitle>
          <DialogDescription>
            This action will reset your season progress and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!canPrestige ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You must reach level {PRESTIGE_LEVEL_CAP} to prestige.
                Current level: {seasonLevel}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Level:</span>
                  <span className="font-semibold">Level {seasonLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">New Prestige Count:</span>
                  <span className="font-semibold">#{prestigeCount + 1}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✨ You will:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Reset to Level 1 (season progress)</li>
                  <li>Gain +1 prestige count</li>
                  <li>Unlock new title/badge</li>
                  <li>Preserve legacy XP</li>
                </ul>
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
            {loading ? 'Processing...' : 'Confirm Prestige'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

