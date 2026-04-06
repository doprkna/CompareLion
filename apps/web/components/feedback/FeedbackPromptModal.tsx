'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FEEDBACK_REWARD_XP, FEEDBACK_REWARD_COINS } from '@/lib/config';

const FEEDBACK_DISMISSED_KEY = 'feedbackPromptDismissed';

export interface FeedbackPromptModalProps {
  open: boolean;
  onClose: () => void;
  onGiveFeedback: () => void;
  onMaybeLater: () => void;
}

export function FeedbackPromptModal({ open, onClose, onGiveFeedback, onMaybeLater }: FeedbackPromptModalProps) {
  const handleMaybeLater = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(FEEDBACK_DISMISSED_KEY, '1');
    }
    onMaybeLater();
    onClose();
  };

  const handleGiveFeedback = () => {
    onGiveFeedback();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Help shape Parel</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          1-minute feedback. Earn {FEEDBACK_REWARD_XP} XP + {FEEDBACK_REWARD_COINS} coins.
        </p>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleMaybeLater}>
            Maybe later
          </Button>
          <Button onClick={handleGiveFeedback}>Give feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function wasFeedbackDismissedThisSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(FEEDBACK_DISMISSED_KEY) === '1';
}
