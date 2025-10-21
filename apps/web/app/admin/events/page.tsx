'use client';

/**
 * Admin Events Manager
 * 
 * Create and manage global events.
 */

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    emoji: "🎉",
    type: "xp_boost",
    bonusType: "percentage",
    bonusValue: 25,
    targetScope: "all",
    startAt: new Date().toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    const res = await apiFetch("/api/admin/events");
    if ((res as any).ok && (res as any).data?.events) {
      setEvents((res as any).data.events);
    }
    setLoading(false);
  }

  async function createEvent() {
    const res = await apiFetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if ((res as any).ok) {
      toast.success("Event created!");
      setShowCreate(false);
      loadEvents();
      // Reset form
      setFormData({
        title: "",
        description: "",
        emoji: "🎉",
        type: "xp_boost",
        bonusType: "percentage",
        bonusValue: 25,
        targetScope: "all",
        startAt: new Date().toISOString().slice(0, 16),
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      });
    } else {
      toast.error((res as any).error || "Failed to create event");
    }
  }

  async function toggleEvent(eventId: string, currentActive: boolean) {
    const res = await apiFetch("/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        action: currentActive ? "deactivate" : "activate",
      }),
    });

    if ((res as any).ok) {
      toast.success(currentActive ? "Event deactivated" : "Event activated");
      loadEvents();
    } else {
      toast.error("Failed to toggle event");
    }
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const res = await apiFetch(`/api/admin/events?id=${eventId}`, {
      method: "DELETE",
    });

    if ((res as any).ok) {
      toast.success("Event deleted");
      loadEvents();
    } else {
      toast.error("Failed to delete event");
    }
  }

  const eventTypes = [
    { value: "xp_boost", label: "XP Boost", emoji: "⭐" },
    { value: "gold_boost", label: "Gold Boost", emoji: "💰" },
    { value: "karma_boost", label: "Karma Boost", emoji: "☯️" },
    { value: "energy_boost", label: "Energy Boost", emoji: "❤️" },
    { value: "special", label: "Special Event", emoji: "🎉" },
  ];

  const bonusTypes = [
    { value: "percentage", label: "Percentage (%)", example: "25 = +25%" },
    { value: "flat", label: "Flat Amount", example: "100 = +100" },
    { value: "multiplier", label: "Multiplier (x)", example: "2 = 2x" },
  ];

  const targetScopes = [
    { value: "all", label: "All Actions" },
    { value: "quiz", label: "Quiz Only" },
    { value: "dare", label: "Dare Challenges" },
    { value: "truth", label: "Truth Challenges" },
    { value: "flow", label: "Flow Questions" },
    { value: "challenge", label: "All Challenges" },
  ];

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">🎉 Global Events Manager</h1>
            <p className="text-subtle mt-1">Create limited-time bonuses and special events</p>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <Card className="bg-card border-accent text-text">
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-subtle mb-1 block">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Courage Week"
                    className="bg-bg border-border text-text"
                  />
                </div>
                <div>
                  <label className="text-sm text-subtle mb-1 block">Emoji</label>
                  <Input
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    placeholder="🎉"
                    className="bg-bg border-border text-text"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-subtle mb-1 block">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Bonus XP on all Dare challenges this week!"
                  className="bg-bg border-border text-text"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-subtle mb-1 block">Event Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-bg border border-border text-text rounded-lg px-3 py-2"
                  >
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.emoji} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-subtle mb-1 block">Bonus Type</label>
                  <select
                    value={formData.bonusType}
                    onChange={(e) => setFormData({ ...formData, bonusType: e.target.value })}
                    className="w-full bg-bg border border-border text-text rounded-lg px-3 py-2"
                  >
                    {bonusTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-muted mt-1 block">
                    {bonusTypes.find((t) => t.value === formData.bonusType)?.example}
                  </span>
                </div>

                <div>
                  <label className="text-sm text-subtle mb-1 block">Bonus Value</label>
                  <Input
                    type="number"
                    value={formData.bonusValue}
                    onChange={(e) => setFormData({ ...formData, bonusValue: parseInt(e.target.value) })}
                    className="bg-bg border-border text-text"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-subtle mb-1 block">Target Scope</label>
                <select
                  value={formData.targetScope}
                  onChange={(e) => setFormData({ ...formData, targetScope: e.target.value })}
                  className="w-full bg-bg border border-border text-text rounded-lg px-3 py-2"
                >
                  {targetScopes.map((scope) => (
                    <option key={scope.value} value={scope.value}>
                      {scope.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-subtle mb-1 block">Start Date</label>
                  <Input
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    className="bg-bg border-border text-text"
                  />
                </div>
                <div>
                  <label className="text-sm text-subtle mb-1 block">End Date</label>
                  <Input
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                    className="bg-bg border-border text-text"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={createEvent} className="flex-1">
                  Create Event
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text">All Events</h2>
          {loading ? (
            <div className="text-center py-12 text-subtle">Loading events...</div>
          ) : events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event) => {
                const isActive =
                  event.active &&
                  new Date(event.startAt) <= new Date() &&
                  new Date(event.endAt) >= new Date();

                return (
                  <Card
                    key={event.id}
                    className={`bg-card text-text ${
                      isActive ? "border-2 border-accent" : "border border-border"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-3xl">{event.emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg">{event.title}</h3>
                              {isActive && (
                                <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded font-bold">
                                  ACTIVE
                                </span>
                              )}
                              {!event.active && (
                                <span className="px-2 py-0.5 bg-zinc-500 text-white text-xs rounded">
                                  INACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-subtle mt-1">{event.description}</p>
                            <div className="flex gap-4 text-xs text-muted mt-2">
                              <span>
                                Type: <span className="text-accent">{event.type}</span>
                              </span>
                              <span>
                                Bonus: <span className="text-accent">{event.bonusValue}{event.bonusType === "percentage" ? "%" : event.bonusType === "multiplier" ? "x" : ""}</span>
                              </span>
                              <span>
                                Scope: <span className="text-accent">{event.targetScope || "all"}</span>
                              </span>
                              <span>
                                Duration: {new Date(event.startAt).toLocaleDateString()} → {new Date(event.endAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => toggleEvent(event.id, event.active)}
                            variant="outline"
                            size="sm"
                            className="gap-1"
                          >
                            {event.active ? (
                              <>
                                <PowerOff className="h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => deleteEvent(event.id)}
                            variant="outline"
                            size="sm"
                            className="gap-1"
                          >
                            <Trash className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-card border-border p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-text mb-2">No Events Created</h3>
              <p className="text-subtle mb-4">Create your first global event to get started!</p>
              <Button onClick={() => setShowCreate(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  async function toggleEvent(eventId: string, currentActive: boolean) {
    const res = await apiFetch("/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        action: currentActive ? "deactivate" : "activate",
      }),
    });

    if ((res as any).ok) {
      toast.success(currentActive ? "Event deactivated" : "Event activated");
      loadEvents();
    } else {
      toast.error("Failed to toggle event");
    }
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const res = await apiFetch(`/api/admin/events?id=${eventId}`, {
      method: "DELETE",
    });

    if ((res as any).ok) {
      toast.success("Event deleted");
      loadEvents();
    } else {
      toast.error("Failed to delete event");
    }
  }
}











