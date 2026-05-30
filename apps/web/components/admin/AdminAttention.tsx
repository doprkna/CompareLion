'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth/isAdmin';

export type AdminAttentionData = {
  needsAttention: boolean;
  totalAttentionCount: number;
  items: { key: string; label: string; count: number; href: string }[];
};

export function useAdminAttention(): AdminAttentionData | null {
  const { data: session, status } = useSession();
  const adminUser = isAdmin(session?.user);
  const [attention, setAttention] = useState<AdminAttentionData | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !adminUser) {
      setAttention(null);
      return;
    }

    let cancelled = false;
    fetch('/api/admin/attention', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (cancelled || !body?.attention) return;
        setAttention(body.attention as AdminAttentionData);
      })
      .catch(() => {
        /* non-blocking */
      });

    return () => {
      cancelled = true;
    };
  }, [status, adminUser]);

  return attention;
}

export function AdminAttentionBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  const label = count > 9 ? '9+' : String(count);
  return (
    <span
      className="inline-flex min-w-[1.1rem] h-[1.1rem] items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none"
      aria-label={`${count} admin actions needed`}
    >
      {label}
    </span>
  );
}

export function AdminNeedsAttentionPanel() {
  const attention = useAdminAttention();

  if (!attention) {
    return (
      <div className="border border-border rounded-lg p-3 bg-bg/40 text-xs text-subtle">
        Needs attention: loading…
      </div>
    );
  }

  if (!attention.needsAttention || attention.items.length === 0) {
    return (
      <div className="border border-green-500/30 rounded-lg p-3 bg-green-500/5 text-sm">
        <h3 className="font-semibold text-green-400">Needs attention</h3>
        <p className="text-subtle text-xs mt-1">No admin actions needed</p>
      </div>
    );
  }

  return (
    <div className="border border-red-500/40 rounded-lg p-3 bg-red-500/5 space-y-2">
      <h3 className="font-semibold text-text flex items-center gap-2 text-sm">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500" aria-hidden />
        Needs attention
        <AdminAttentionBadge count={attention.totalAttentionCount} />
      </h3>
      <ul className="space-y-1.5">
        {attention.items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className="text-xs text-accent hover:underline flex items-center justify-between gap-2"
            >
              <span>{item.label}</span>
              <span className="font-mono text-red-400 shrink-0">{item.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
