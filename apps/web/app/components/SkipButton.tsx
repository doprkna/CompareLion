/**
 * Skip Button Component
 * Skip a question
 * v0.37.2 - Skip Question Feature
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SkipForward } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { toast } from 'sonner';

interface SkipButtonProps {
  questionId: string;
  onSkip?: () => void; // Callback when skip succeeds
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function SkipButton({ 
  questionId, 
  onSkip,
  className, 
  size = 'sm',
  variant = 'outline'
}: SkipButtonProps) {
  const [skipping, setSkipping] = useState(false);

  async function handleSkip() {
    if (skipping) return;

    setSkipping(true);

    try {
      const res = await apiFetch('/api/questions/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      });

      if (!(res as any).ok) {
        throw new Error((res as any).error || 'Failed to skip question');
      }

      // Call callback to hide question optimistically
      onSkip?.();

      toast.success('Question skipped');
    } catch (error: any) {
      toast.error(error.message || 'Failed to skip question');
    } finally {
      setSkipping(false);
    }
  }

  return (
    <Button
      onClick={handleSkip}
      disabled={skipping}
      variant={variant}
      size={size}
      className={className}
      title="Skip this question"
    >
      <SkipForward className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} />
      {size !== 'sm' && <span className="ml-2">Skip</span>}
    </Button>
  );
}

