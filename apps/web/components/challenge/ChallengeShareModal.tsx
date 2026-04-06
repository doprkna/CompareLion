'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';

interface ChallengeShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
}

export function ChallengeShareModal({
  open,
  onOpenChange,
  shareUrl,
}: ChallengeShareModalProps) {
  const { toast } = useToast();

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(
      () => toast({ title: 'Copied!' }),
      () => toast({ title: 'Copy failed', variant: 'destructive' })
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Share this link to compare answers</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-2 rounded border border-border bg-bg text-sm"
          />
          <Button onClick={copyUrl} variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
