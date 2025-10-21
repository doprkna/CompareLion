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
import { eventBus } from "@/lib/eventBus";

export function useRealtime() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    function connect() {
      if (!mounted) return;

      try {
        console.log("📡 Connecting to real-time server...");
        
        const eventSource = new EventSource("/api/realtime");
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log("✅ Real-time connection established");
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.event === "connected") {
              console.log("📡 Real-time handshake complete");
              return;
            }

            // Emit to local event bus
            console.log(`[SSE→Local] ${data.event}:`, data.payload);
            eventBus.emit(data.event, data.payload);
          } catch (err) {
            console.error("❌ Failed to parse SSE message:", err);
          }
        };

        eventSource.onerror = (error) => {
          console.warn("⚠️ Real-time connection error, attempting reconnect...");
          eventSource.close();
          
          // Exponential backoff reconnect
          if (mounted && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              connect();
            }, 5000); // Reconnect after 5 seconds
          }
        };

      } catch (err) {
        console.error("❌ Failed to establish real-time connection:", err);
      }
    }

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      mounted = false;
      
      if (eventSourceRef.current) {
        console.log("👋 Closing real-time connection");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
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










