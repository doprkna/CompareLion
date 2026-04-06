'use client';

import { useState, useEffect, useMemo } from 'react';
import { generateSigilHeatmap } from '@parel/core/sigils/heatmap';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Size = 'sm' | 'md' | 'lg';

interface SigilProps {
  userId: string;
  size?: Size;
  onClick?: () => void;
  /** When false, no modal/expand on click (e.g. inside dropdown) */
  expandOnClick?: boolean;
  className?: string;
}

const SIZE_MAP: Record<Size, number> = { sm: 40, md: 64, lg: 120 };

export function Sigil({ userId, size = 'md', onClick, expandOnClick = true, className }: SigilProps) {
  const [buckets, setBuckets] = useState<number[] | null>(null);
  const [placeholder, setPlaceholder] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/user/activity-buckets', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data.buckets)) return;
        setBuckets(data.buckets);
        setPlaceholder(Boolean(data.placeholder));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const { svg } = useMemo(() => {
    const b = buckets ?? Array(56).fill(0);
    return generateSigilHeatmap({ buckets: b, seed: userId ?? 'anonymous' });
  }, [buckets, userId]);

  const px = SIZE_MAP[size] ?? SIZE_MAP.md;
  const handleClick = () => {
    if (onClick) onClick();
    else if (expandOnClick) setOpen(true);
  };
  const canExpand = expandOnClick && !onClick;

  if (!userId) return null;

  const content = (
        <div
          style={{ width: px, height: px }}
          className="[&_svg]:w-full [&_svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
  );

  return (
    <>
      {canExpand ? (
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center justify-center rounded-lg overflow-hidden border border-border bg-card hover:opacity-90 transition ${className ?? ''}`}
          style={{ width: px, height: px }}
          title={placeholder ? 'New profile, sigil will evolve with activity.' : 'Activity sigil'}
        >
          {content}
        </button>
      ) : (
        <span
          className={`inline-flex items-center justify-center rounded-lg overflow-hidden border border-border bg-card ${className ?? ''}`}
          style={{ width: px, height: px }}
          title={placeholder ? 'New profile, sigil will evolve with activity.' : 'Activity sigil'}
        >
          {content}
        </span>
      )}
      {canExpand && (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Activity Sigil</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-2">
            <div
              className="rounded-xl overflow-hidden border border-border"
              style={{ width: 200, height: 180 }}
            >
              <div
                className="w-full h-full [&_svg]:w-full [&_svg]:h-full"
                dangerouslySetInnerHTML={{
                  __html: generateSigilHeatmap({
                    buckets: buckets ?? Array(56).fill(0),
                    seed: userId ?? 'anonymous',
                  }).svg,
                }}
              />
            </div>
            {placeholder && (
              <p className="text-sm text-subtle text-center">
                New profile, sigil will evolve with activity.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      )}
    </>
  );
}
