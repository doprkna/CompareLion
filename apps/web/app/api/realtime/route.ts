/**
 * Real-Time Server-Sent Events (SSE) Endpoint
 * 
 * Provides a persistent connection for real-time event streaming.
 * Better Next.js compatibility than WebSockets.
 * 
 * Usage: EventSource('/api/realtime')
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
function initializeEventListeners() {
  if (initialized) return;
  initialized = true;

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

}

export async function GET(request: NextRequest) {
  // Initialize event listeners
  initializeEventListeners();

  // Create a stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add connection to set
      connections.add(controller);

      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ event: "connected", payload: { timestamp: Date.now() } })}\n\n`);

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(`: keepalive\n\n`);
        } catch {
          clearInterval(keepAlive);
        }
      }, 30000);

      // Cleanup on disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        connections.delete(controller);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}













