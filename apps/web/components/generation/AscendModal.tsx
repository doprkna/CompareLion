'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAscend } from '@parel/core/hooks/useAscend';

interface AscendModalProps {
  open: boolean;
  onClose: () => void;
  currentGeneration: number;
  prestigeCount: number;
  canAscend: boolean;
  onAscended?: () => void;
}

const PRESTIGE_THRESHOLD = 3;

const AVAILABLE_PERKS = [
  { type: 'xpBoost', value: 2, label: '+2% XP Gain Boost' },
  { type: 'xpBoost', value: 5, label: '+5% XP Gain Boost' },
  { type: 'title', value: 'Echo', label: 'Title: Echo' },
  { type: 'title', value: 'Legacy', label: 'Title: Legacy' },
  { type: 'karmaBoost', value: 1, label: '+1 Karma per Action' },
  { type: 'karmaBoost', value: 2, label: '+2 Karma per Action' },
];

export function AscendModal({
  open,
  onClose,
  currentGeneration,
  prestigeCount,
  canAscend,
  onAscended,
}: AscendModalProps) {
  const [perk1, setPerk1] = useState<string>('');
  const [perk2, setPerk2] = useState<string>('');
  const { ascend, loading, error } = useAscend();

  const handleAscend = async () => {
    const inheritedPerks: Array<{ type: string; value: string | number }> = [];

    if (perk1) {
      const perk = AVAILABLE_PERKS.find((p) => p.type === perk1.split('-')[0] && String(p.value) === perk1.split('-')[1]);
      if (perk) {
        inheritedPerks.push({ type: perk.type, value: perk.value });
      }
    }

    if (perk2 && inheritedPerks.length < 2) {
      const perk = AVAILABLE_PERKS.find((p) => p.type === perk2.split('-')[0] && String(p.value) === perk2.split('-')[1]);
      if (perk) {
        inheritedPerks.push({ type: perk.type, value: perk.value });
      }
    }

    if (inheritedPerks.length === 0) {
      return;
    }

    try {
      const result = await ascend(inheritedPerks);
      if (result?.success) {
        onAscended?.();
        onClose();
      }
    } catch (e) {
      console.error('Ascension failed:', e);
    }
  };

  const selectedPerk1 = perk1 ? AVAILABLE_PERKS.find((p) => `${p.type}-${p.value}` === perk1) : null;
  const selectedPerk2 = perk2 ? AVAILABLE_PERKS.find((p) => `${p.type}-${p.value}` === perk2) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Ascend to Next Generation
          </DialogTitle>
          <DialogDescription>
            Archive current progress and start a new generation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!canAscend ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Not Ready Yet
                </span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You must reach Prestige {PRESTIGE_THRESHOLD} to ascend.
                Current Prestige: {prestigeCount}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Generation:</span>
                  <span className="font-semibold">Gen {currentGeneration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Generation:</span>
                  <span className="font-bold text-primary">Gen {currentGeneration + 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prestige Count:</span>
                  <span className="font-semibold">{prestigeCount}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Select Inherited Perks (1-2)
                </div>

                <div className="space-y-2">
                  <Select value={perk1} onValueChange={setPerk1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select first perk (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_PERKS.map((perk) => (
                        <SelectItem key={`${perk.type}-${perk.value}`} value={`${perk.type}-${perk.value}`}>
                          {perk.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={perk2} onValueChange={setPerk2} disabled={!perk1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select second perk (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_PERKS.filter((p) => `${p.type}-${p.value}` !== perk1).map((perk) => (
                        <SelectItem key={`${perk.type}-${perk.value}`} value={`${perk.type}-${perk.value}`}>
                          {perk.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(selectedPerk1 || selectedPerk2) && (
                  <div className="bg-muted rounded-lg p-3 border border-border mt-2">
                    <div className="text-xs font-semibold text-muted-foreground mb-2">Selected Perks:</div>
                    <div className="space-y-1 text-sm">
                      {selectedPerk1 && (
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          <span>{selectedPerk1.label}</span>
                        </div>
                      )}
                      {selectedPerk2 && (
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          <span>{selectedPerk2.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ This action is irreversible. Your current generation will be archived, and you'll start Generation {currentGeneration + 1}.
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
              Error: {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleAscend}
            disabled={loading || !canAscend || (!perk1 && !perk2)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ascending...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Ascend
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

