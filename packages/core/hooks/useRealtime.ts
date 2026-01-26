'use client';
// sanity-fix
/**
 * useRealtime Hook
 * 
 * Establishes a persistent Server-Sent Events (SSE) connection
 * for real-time updates from the server.
 * 
 * Usage:
 * ```tsx
 * function App() {
 *   useRealtime(); // Establishes global connection
 *   return <YourApp />;
 * }
 * ```
 */

'use client';

import { useEffect, useRef } from "react";
import { eventBus } from "./eventBus"; // sanity-fix
import { logger } from '../utils/debug'; // sanity-fix: replaced @parel/core self-import with relative import

export function useRealtime() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  useEffect(() => {
    let mounted = true;

    async function checkStatusAndConnect() {
      if (!mounted || isConnectingRef.current) return;
      isConnectingRef.current = true;

      try {
        // Check status first
        const statusRes = await fetch("/api/realtime/status");
        const status = await statusRes.json();

        if (!status.ok || status.mode !== "enabled") {
          logger.debug("📡 Real-time disabled, skipping connection", { reason: status.reason });
          // Retry status check after 60s when disabled
          if (mounted && !statusCheckTimeoutRef.current) {
            statusCheckTimeoutRef.current = setTimeout(() => {
              statusCheckTimeoutRef.current = null;
              isConnectingRef.current = false;
              checkStatusAndConnect();
            }, 60000); // 60s backoff when disabled
          } else {
            isConnectingRef.current = false;
          }
          return;
        }

        // Status is enabled, connect to SSE
        isConnectingRef.current = false;
        connect();
      } catch (err) {
        logger.warn("Failed to check real-time status, retrying with backoff", err);
        // Retry status check with backoff on error
        if (mounted && !statusCheckTimeoutRef.current) {
          statusCheckTimeoutRef.current = setTimeout(() => {
            statusCheckTimeoutRef.current = null;
            isConnectingRef.current = false;
            checkStatusAndConnect();
          }, 10000); // 10s backoff on error
        } else {
          isConnectingRef.current = false;
        }
      }
    }

    function connect() {
      if (!mounted || eventSourceRef.current) return; // Prevent duplicate connections

      try {
        logger.debug("📡 Connecting to real-time server...");
        
        const eventSource = new EventSource("/api/realtime/sse");
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          logger.info("✅ Real-time connection established");
        };

        eventSource.addEventListener("disabled", (event) => {
          logger.debug("📡 Real-time disabled by server");
          eventSource.close();
          eventSourceRef.current = null;
          // Retry status check after 60s
          if (mounted && !statusCheckTimeoutRef.current) {
            statusCheckTimeoutRef.current = setTimeout(() => {
              statusCheckTimeoutRef.current = null;
              checkStatusAndConnect();
            }, 60000); // 60s backoff when disabled
          }
        });

        eventSource.addEventListener("ping", () => {
          // Keep-alive received, connection is healthy
        });

        eventSource.onmessage = (event) => {
          try {
            if (!event || !event.data) return; // sanity-fix
            const data = JSON.parse(event.data);
            
            if (data?.event === "connected") { // sanity-fix
              logger.debug("📡 Real-time handshake complete");
              return;
            }

            // Emit to local event bus
            logger.debug('[SSE→Local] Event received', { event: data?.event, payload: data?.payload }); // sanity-fix
            if (data?.event) { // sanity-fix
              eventBus.emit(data.event, data?.payload);
            }
          } catch (err) {
            logger.error("Failed to parse SSE message", err);
          }
        };

        eventSource.onerror = (error) => {
          logger.warn("Real-time connection error, attempting reconnect...");
          eventSource.close();
          eventSourceRef.current = null;
          
          // Exponential backoff reconnect
          if (mounted && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              checkStatusAndConnect();
            }, 5000); // Reconnect after 5 seconds
          }
        };

      } catch (err) {
        logger.error("Failed to establish real-time connection", err);
      }
    }

    // Check status first, then connect if enabled
    checkStatusAndConnect();

    // Cleanup on unmount
    return () => {
      mounted = false;
      isConnectingRef.current = false;
      
      if (eventSourceRef.current) {
        logger.debug("👋 Closing real-time connection");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (statusCheckTimeoutRef.current) {
        clearTimeout(statusCheckTimeoutRef.current);
        statusCheckTimeoutRef.current = null;
      }
    };
  }, []);
}

/**
 * Hook to check if real-time connection is active
 * @returns boolean indicating connection status
 */
export function useRealtimeStatus() {
  // This is a simplified version - could be enhanced with state management
  return typeof EventSource !== "undefined";
}












