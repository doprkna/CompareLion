'use client';

import { useFeatureGate } from '@/lib/hooks';
import type { FeatureKey } from '@parel/core/config/featureGates';
import { Lock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  feature: FeatureKey;
  mode: 'hide' | 'placeholder';
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Wraps content with feature gate. When locked:
 * - hide: render nothing
 * - placeholder: render subtle lock placeholder with tooltip
 */
export function FeatureGate({ feature, mode, label, children, className }: FeatureGateProps) {
  const { allowed, message } = useFeatureGate(feature);

  if (allowed) {
    return <>{children}</>;
  }

  if (mode === 'hide') {
    return null;
  }

  const placeholder = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm text-subtle opacity-70',
        className
      )}
    >
      {label ?? 'Locked'}
      <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
    </span>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help inline-flex">{placeholder}</span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs">{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
