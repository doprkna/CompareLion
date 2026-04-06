'use client';

/**
 * Skip Topic Suggestion Modal
 * Shown when user skips 2+ questions in a flow.
 * Gentle nudge to try another topic - not a punishment.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface SkipTopicSuggestionModalProps {
  open: boolean;
  onContinue: () => void;
  onChooseAnother: () => void;
}

export function SkipTopicSuggestionModal({
  open,
  onContinue,
  onChooseAnother,
}: SkipTopicSuggestionModalProps) {
  const handleOpenChange = (o: boolean) => {
    if (!o) onContinue(); // Dismiss (X or overlay) = continue
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Not your mood?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Maybe try another topic? You can switch to a different flow anytime.
        </p>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onContinue}>
            Continue this topic
          </Button>
          <Button onClick={onChooseAnother}>
            Choose another topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
