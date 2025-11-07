'use client';

/**
 * EventBanner Component
 * 
 * Displays active global events at the top of pages.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/apiBase";
import { useEventBus } from "@/hooks/useEventBus";
import { X, Clock } from "lucide-react";

export default function EventBanner() {
  const [events, setEvents] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();

    // Refresh every 5 minutes
    const interval = setInterval(loadEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for new/updated events
  useEventBus("event:created", loadEvents);
  useEventBus("event:updated", loadEvents);
  useEventBus("event:deactivated", loadEvents);

  async function loadEvents() {
    const res = await apiFetch("/api/events/active");
    if ((res as any).ok && (res as any).data?.events) {
      setEvents((res as any).data.events);
    }
    setLoading(false);
  }

  function dismissEvent(eventId: string) {
    setDismissed(new Set(dismissed).add(eventId));
    // Store in localStorage to persist across sessions
    const dismissedIds = JSON.parse(localStorage.getItem("dismissedEvents") || "[]");
    localStorage.setItem("dismissedEvents", JSON.stringify([...dismissedIds, eventId]));
  }

  // Load dismissed events from localStorage
  useEffect(() => {
    const dismissedIds = JSON.parse(localStorage.getItem("dismissedEvents") || "[]");
    setDismissed(new Set(dismissedIds));
  }, []);

  const visibleEvents = events.filter((e) => !dismissed.has(e.id));

  if (loading || visibleEvents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {visibleEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            <div
              className={`${event.displayInfo.color} text-white px-6 py-3 rounded-lg shadow-lg relative overflow-hidden`}
            >
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1))",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Content */}
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{event.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{event.title}</span>
                      <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-bold uppercase tracking-wider">
                        {event.displayInfo.badgeText}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm opacity-90 mt-0.5">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Bonus Display */}
                  <div className="bg-white/20 px-4 py-2 rounded-lg">
                    <div className="text-2xl font-bold">
                      {event.displayInfo.bonusText}
                    </div>
                    {event.targetScope && event.targetScope !== "all" && (
                      <div className="text-xs opacity-80 mt-0.5">
                        on {event.targetScope}
                      </div>
                    )}
                  </div>

                  {/* Time Remaining */}
                  <div className="flex items-center gap-1 text-sm opacity-90">
                    <Clock className="h-4 w-4" />
                    <span>{event.timeRemaining}</span>
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={() => dismissEvent(event.id)}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                    title="Dismiss"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}













