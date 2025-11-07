'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Moon, Sparkles, Zap } from 'lucide-react';
import { useResolveDream } from '@/hooks/useResolveDream';

interface DreamEventModalProps {
  open: boolean;
  onClose: () => void;
  dream: {
    id: string;
    dreamId: string;
    title: string;
    description: string;
    flavorTone: string;
    effect: any;
  };
  onResolved?: () => void;
}

const toneEmojis: Record<string, string> = {
  calm: '🌊',
  chaotic: '🌀',
  mystic: '✨',
};

const toneGradients: Record<string, string> = {
  calm: 'from-blue-500/20 to-purple-500/20',
  chaotic: 'from-red-500/20 to-orange-500/20',
  mystic: 'from-purple-500/20 to-pink-500/20',
};

export function DreamEventModal({ open, onClose, dream, onResolved }: DreamEventModalProps) {
  const { resolve, loading, error } = useResolveDream();

  const handleResolve = async () => {
    try {
      const result = await resolve(dream.id);
      if (result?.success) {
        onResolved?.();
        onClose();
      }
    } catch (e) {
      console.error('Failed to resolve dream:', e);
    }
  };

  const effect = dream.effect || {};
  const xpShift = effect.xpShift || 0;
  const karmaFlux = effect.karmaFlux || 0;
  const moodChange = effect.moodChange || null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/30 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Moon className="w-6 h-6 text-purple-400" />
            {toneEmojis[dream.flavorTone] || '🌙'} Dreamspace
          </DialogTitle>
          <DialogDescription className="text-purple-200/70">
            You drift into the Dreamspace...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Dream Content */}
          <div className={`bg-gradient-to-br ${toneGradients[dream.flavorTone] || toneGradients.mystic} rounded-lg p-4 border border-purple-500/30 backdrop-blur-sm`}>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-300" />
              {dream.title}
            </h3>
            <p className="text-sm text-purple-100/80 leading-relaxed">
              {dream.description}
            </p>
          </div>

          {/* Effects Preview */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/20 space-y-2">
            <div className="text-xs font-semibold text-purple-300 mb-2">Effects:</div>
            {xpShift !== 0 && (
              <div className="flex items-center gap-2 text-sm text-purple-200">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>XP: {xpShift > 0 ? '+' : ''}{xpShift}%</span>
              </div>
            )}
            {karmaFlux !== 0 && (
              <div className="flex items-center gap-2 text-sm text-purple-200">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Karma: {karmaFlux > 0 ? '+' : ''}{karmaFlux}</span>
              </div>
            )}
            {moodChange && (
              <div className="flex items-center gap-2 text-sm text-purple-200">
                <Moon className="w-4 h-4 text-blue-400" />
                <span>Mood: {moodChange}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-300 rounded-lg p-3 border border-red-500/30 text-sm">
              Error: {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading} className="border-purple-500/30">
            Close
          </Button>
          <Button
            onClick={handleResolve}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {loading ? 'Resolving...' : 'Resolve Dream'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

