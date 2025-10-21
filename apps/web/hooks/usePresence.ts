/**
 * usePresence Hook
 * 
 * Sends periodic heartbeat pings to update user's online status.
 * Runs automatically for authenticated users.
 * 
 * Heartbeat: Every 25 seconds
 */

'use client';

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/apiBase";

const HEARTBEAT_INTERVAL_MS = 25000; // 25 seconds

export function usePresence() {
  const { data: session, status } = useSession();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    // Only run for authenticated users
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    stopRef.current = false;

    async function ping() {
      if (stopRef.current) return;

      try {
        await apiFetch("/api/presence", { method: "POST" });
        console.log("📍 Presence ping sent");
      } catch (error) {
        console.warn("⚠️ Presence ping failed:", error);
      }

      // Schedule next ping
      if (!stopRef.current) {
        timeoutRef.current = setTimeout(ping, HEARTBEAT_INTERVAL_MS);
      }
    }

    // Start heartbeat
    ping();

    // Cleanup on unmount
    return () => {
      stopRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [status, session]);
}











