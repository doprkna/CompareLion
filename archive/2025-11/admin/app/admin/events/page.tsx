'use client';

/**
 * Admin Events Page
 * v0.36.15 - Event System
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiBase';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Plus, Edit, Trash2, Calendar, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface RpgEvent {
  id: string;
  code: string;
  name: string;
  description: string | null;
  effect: any;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

const PREDEFINED_EVENTS = [
  { code: 'blood_moon', name: 'Blood Moon', description: 'ATK +20%, CRIT +10%' },
  { code: 'shield_week', name: 'Shield Week', description: 'DEF +25%' },
  { code: 'fortune_day', name: 'Fortune Day', description: 'Gold +20%' },
  { code: 'xp_surge', name: 'XP Surge', description: 'XP +30%' },
  { code: 'swift_winds', name: 'Swift Winds', description: 'Speed +15%' },
  { code: 'monster_frenzy', name: 'Monster Frenzy', description: 'Enemies: ATK +10%, HP +10%' },
];

export default function AdminEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<RpgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<RpgEvent | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      loadEvents();
    }
  }, [status, router]);

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/events');
      if ((res as any).ok && (res as any).data?.events) {
        setEvents((res as any).data.events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  async function toggleEventActive(eventId: string, currentActive: boolean) {
    try {
      const res = await apiFetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if ((res as any).ok) {
        toast.success(`Event ${!currentActive ? 'activated' : 'deactivated'}`);
        loadEvents();
      } else {
        throw new Error((res as any).error || 'Failed to toggle event');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to toggle event');
    }
  }

  async function triggerEventNow(eventCode: string) {
    try {
      const event = events.find(e => e.code === eventCode);
      if (!event) return;

      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      const res = await apiFetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startsAt: now.toISOString(),
          endsAt: oneHourLater.toISOString(),
          active: true,
        }),
      });

      if ((res as any).ok) {
        toast.success(`Event "${event.name}" triggered for 1 hour`);
        loadEvents();
      } else {
        throw new Error((res as any).error || 'Failed to trigger event');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to trigger event');
    }
  }

  async function seedEvents() {
    try {
      const res = await apiFetch('/api/admin/events', {
        method: 'PUT',
      });

      if ((res as any).ok) {
        toast.success(`Seeded ${(res as any).data?.count || 0} events`);
        loadEvents();
      } else {
        throw new Error((res as any).error || 'Failed to seed events');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to seed events');
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">🎮 RPG Events</h1>
            <p className="text-subtle">Manage global event modifiers</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={seedEvents} variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Seed Events
            </Button>
            <Button onClick={loadEvents} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Trigger Section */}
        <Card className="bg-card border-2 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Quick Trigger Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PREDEFINED_EVENTS.map((predef) => (
                <Button
                  key={predef.code}
                  onClick={() => triggerEventNow(predef.code)}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {predef.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card className="bg-card border-2 border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">All Events</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => {
                  const isActive = event.active && 
                    new Date(event.startsAt) <= new Date() && 
                    new Date(event.endsAt) >= new Date();
                  
                  return (
                    <div
                      key={event.id}
                      className={`p-4 rounded border-2 ${
                        isActive ? 'border-accent bg-accent/10' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-text">{event.name}</h3>
                            {isActive && (
                              <span className="text-xs px-2 py-0.5 bg-accent text-white rounded">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-subtle mb-2">{event.description}</p>
                          <div className="text-xs text-subtle">
                            <div>Code: <code className="bg-bg px-1 rounded">{event.code}</code></div>
                            <div>Starts: {new Date(event.startsAt).toLocaleString()}</div>
                            <div>Ends: {new Date(event.endsAt).toLocaleString()}</div>
                            <div>Effect: <code className="bg-bg px-1 rounded">{JSON.stringify(event.effect)}</code></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`toggle-${event.id}`} className="text-sm">
                              Active
                            </Label>
                            <Switch
                              id={`toggle-${event.id}`}
                              checked={event.active}
                              onCheckedChange={() => toggleEventActive(event.id, event.active)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-subtle">
                <p>No events found. Click "Seed Events" to create predefined events.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
