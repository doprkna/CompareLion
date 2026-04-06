'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Zap } from 'lucide-react';

export interface WelcomeRecap {
  yesterdayAnswered: number;
  yesterdayXp: number;
  streakCount: number;
  socialHint: string | null;
  yesterdayCharmsCompleted?: number;
  yesterdayCharmsTotal?: number;
}

interface WelcomeBackModalProps {
  open: boolean;
  onClose: () => void;
  recap: WelcomeRecap;
}

export function WelcomeBackModal({ open, onClose, recap }: WelcomeBackModalProps) {
  const router = useRouter();

  const handlePrimary = () => {
    onClose();
    router.push('/flow-demo');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-text">Welcome back</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Button
            size="lg"
            className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-500/90"
            onClick={handlePrimary}
          >
            <Zap className="h-5 w-5" />
            Continue Today&apos;s Flow
          </Button>

          <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-1 text-sm text-subtle">
            {recap.yesterdayAnswered > 0 ? (
              <>
                <p>Yesterday you answered {recap.yesterdayAnswered} question{recap.yesterdayAnswered !== 1 ? 's' : ''}.</p>
                <p>+{recap.yesterdayXp} XP earned.</p>
              </>
            ) : (
              <p>Ready to dive back in.</p>
            )}
            {recap.streakCount > 0 && (
              <p className="font-medium text-text">🔥 Streak: {recap.streakCount} day{recap.streakCount !== 1 ? 's' : ''}</p>
            )}
            {recap.yesterdayCharmsTotal != null && recap.yesterdayCharmsTotal > 0 && (
              <p>✨ You completed {recap.yesterdayCharmsCompleted ?? 0}/{recap.yesterdayCharmsTotal} charms yesterday.</p>
            )}
          </div>

          {recap.socialHint && (
            <p className="text-xs text-subtle">{recap.socialHint}</p>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-subtle hover:text-text underline"
            >
              Skip
            </button>
            <Link
              href="/recap"
              className="text-sm text-subtle hover:text-accent underline"
              onClick={onClose}
            >
              View Yesterday
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
