import React from 'react';
import { getEnvStamp } from '@/lib/env';
import { APP_VERSION } from '@/lib/config';

/** Low-noise environment badge (not in navbar). Hidden in production. */
export default function EnvStamp() {
  const stamp = getEnvStamp();
  if (stamp === 'PROD') return null;

  return (
    <div
      className="fixed bottom-2 left-2 z-40 px-2 py-1 text-[10px] font-mono font-medium text-subtle bg-card/90 border border-border rounded pointer-events-none select-none opacity-60 hover:opacity-100 transition-opacity"
      aria-hidden
    >
      {stamp} • v{APP_VERSION}
    </div>
  );
}
