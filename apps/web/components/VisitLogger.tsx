'use client';

/**
 * Logs one app visit per browser session (sessionStorage) + POST /api/visit.
 * v0.48.02
 */

import { useEffect } from 'react';

const FLAG = 'visit_logged';

export function VisitLogger() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (sessionStorage.getItem(FLAG)) return;
      sessionStorage.setItem(FLAG, 'true');
      fetch('/api/visit', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch {
      // sessionStorage may throw in private mode
    }
  }, []);

  return null;
}
