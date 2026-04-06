'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiBase';

const HEARTBEAT_INTERVAL_MS = 30_000;
const PING_URL = '/api/presence/ping';

export function usePresencePing() {
  const { data: session, status } = useSession();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;

    function ping() {
      apiFetch(PING_URL, { method: 'POST' }).catch(() => {});
    }
    function userPing() {
      apiFetch('/api/user/ping', { method: 'POST' }).catch(() => {});
    }

    function schedule() {
      if (document.visibilityState === 'hidden') return;
      userPing(); // update lastActiveAt once per session
      ping();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    }

    function stop() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') schedule();
      else stop();
    };

    schedule();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [status, session?.user]);
}
