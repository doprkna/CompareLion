'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SharePreview } from './SharePreview';
import { ShareButton } from './ShareButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useGenerateShare } from '@parel/core/hooks/useGenerateShare';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShareModal({ open, onClose }: ShareModalProps) {
  const [type, setType] = useState<'weekly' | 'achievement' | 'comparison'>('weekly');
  const [shareCard, setShareCard] = useState<any | null>(null);
  const { generate, loading, error } = useGenerateShare();

  const handleGenerate = async () => {
    try {
      const result = await generate(type);
      if (result?.shareCard) {
        setShareCard(result.shareCard);
      }
    } catch (e) {
      console.error('Failed to generate share card:', e);
    }
  };

  const handleClose = () => {
    setShareCard(null);
    setType('weekly');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Card
          </DialogTitle>
          <DialogDescription>
            Generate a shareable card from your stats or reflection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareCard && (
            <div className="space-y-3">
              <label className="text-sm font-semibold">Select Type</label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="achievement">Achievements</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {type === 'weekly' && 'Generate a card showing your weekly progress and reflections'}
                {type === 'achievement' && 'Generate a card showing your achievements and milestones'}
                {type === 'comparison' && 'Generate a card comparing your stats to others'}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-4">
              Error: {error}
            </div>
          )}

          {shareCard && (
            <SharePreview shareCard={shareCard} loading={loading} />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {shareCard ? 'Close' : 'Cancel'}
          </Button>
          {!shareCard ? (
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-accent hover:bg-accent/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Generate Card
                </>
              )}
            </Button>
          ) : (
            <ShareButton shareCard={shareCard} onShare={() => setShareCard(null)} />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

