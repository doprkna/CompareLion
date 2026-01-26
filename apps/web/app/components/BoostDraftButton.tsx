/**
 * Boost Draft Button Component
 * Boost a draft (+1)
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { toast } from 'sonner';

interface BoostDraftButtonProps {
  draftId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BoostDraftButton({ draftId, className, size = 'sm' }: BoostDraftButtonProps) {
  const [boosting, setBoosting] = useState(false);

  async function handleBoost() {
    if (boosting) return;

    setBoosting(true);
    try {
      const res = await apiFetch('/api/drafts/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId }),
      });

      if (!(res as any).ok) {
        throw new Error((res as any).error || 'Failed to boost draft');
      }

      toast.success('Draft boosted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to boost draft');
    } finally {
      setBoosting(false);
    }
  }

  return (
    <Button
      onClick={handleBoost}
      disabled={boosting}
      variant="outline"
      size={size}
      className={className}
      title="Boost this draft"
    >
      {boosting ? (
        <Loader2 className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} />
      ) : (
        <>
          <TrendingUp className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
          {size !== 'sm' && <span className="ml-2">Boost</span>}
        </>
      )}
    </Button>
  );
}

