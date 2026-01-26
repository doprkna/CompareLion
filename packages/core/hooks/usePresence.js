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
import { apiFetch } from "./apiBase"; // sanity-fix
import { logger } from '../utils/debug'; // sanity-fix: replaced @parel/core self-import with relative import
const HEARTBEAT_INTERVAL_MS = 25000; // 25 seconds
export function usePresence() {
    const { data: session, status } = useSession();
    const timeoutRef = useRef(null);
    const stopRef = useRef(false);
    useEffect(() => {
        // Only run for authenticated users
        if (status !== "authenticated" || !session?.user) {
            return;
        }
        stopRef.current = false;
        async function ping() {
            if (stopRef.current)
                return;
            try {
                await apiFetch("/api/presence", { method: "POST" });
                logger.debug("📍 Presence ping sent");
            }
            catch (error) {
                logger.warn("Presence ping failed", error);
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
