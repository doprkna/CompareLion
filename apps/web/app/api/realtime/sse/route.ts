/**
 * Real-Time Server-Sent Events (SSE) Endpoint
 * 
 * Always returns SSE stream.
 * If disabled: sends one "disabled" event then closes cleanly.
 * If enabled: sends ping every 15s and broadcasts events.
 */

import { NextRequest } from "next/server";
import { eventBus } from "@/lib/eventBus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Keep track of active connections
const connections = new Set<ReadableStreamDefaultController>();

// Event listeners for broadcasting
const eventHandlers: Record<string, (payload: any) => void> = {};

// Events to broadcast to clients
const BROADCAST_EVENTS = [
  "message:new",
  "xp:update",
  "activity:new",
  "achievement:unlock",
  "level:up",
];

// Initialize event listeners (only once)
let initialized = false;
let isEnabled = true;

function initializeEventListeners() {
  if (initialized) return;
  initialized = true;

  try {
    BROADCAST_EVENTS.forEach((event) => {
      const handler = (payload: any) => {
        const data = JSON.stringify({ event, payload });
        
        // Broadcast to all connected clients
        connections.forEach((controller) => {
          try {
            controller.enqueue(`data: ${data}\n\n`);
          } catch (err) {
            // Client disconnected, will be cleaned up
          }
        });
      };

      eventHandlers[event] = handler;
      eventBus.on(event, handler);
    });
    isEnabled = true;
  } catch (err) {
    isEnabled = false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize event listeners (safe - won't throw)
    try {
      initializeEventListeners();
    } catch (initError) {
      isEnabled = false;
    }

    // Create a stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Add connection to set
        connections.add(controller);

        if (!isEnabled) {
          // Send disabled event, flush, then close
          try {
            controller.enqueue(`event: disabled\n`);
            controller.enqueue(`data: ${JSON.stringify({ reason: "realtime disabled" })}\n\n`);
            // Small delay to ensure flush before close
            setTimeout(() => {
              try {
                controller.close();
                connections.delete(controller);
              } catch {
                // Already closed
              }
            }, 100);
            return;
          } catch {
            // Already closed
            try {
              controller.close();
              connections.delete(controller);
            } catch {
              // Ignore
            }
            return;
          }
        }

        // Send initial connection message
        try {
          controller.enqueue(`data: ${JSON.stringify({ event: "connected", payload: { timestamp: Date.now() } })}\n\n`);
        } catch {
          // Stream already closed
        }

        // Keep-alive ping every 15 seconds
        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(`event: ping\n`);
            controller.enqueue(`data: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);
          } catch {
            clearInterval(keepAlive);
            connections.delete(controller);
          }
        }, 15000);

        // Store interval reference for cleanup
        const cleanup = () => {
          clearInterval(keepAlive);
          connections.delete(controller);
          try {
            controller.close();
          } catch {
            // Already closed
          }
        };

        // Cleanup on disconnect
        request.signal.addEventListener("abort", cleanup);
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    // If stream creation fails, still return SSE with disabled event
    const errorStream = new ReadableStream({
      start(controller) {
        try {
          controller.enqueue(`event: disabled\n`);
          controller.enqueue(`data: ${JSON.stringify({ reason: "stream creation failed" })}\n\n`);
          controller.close();
        } catch {
          // Ignore
        }
      },
    });

    return new Response(errorStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  }
}
