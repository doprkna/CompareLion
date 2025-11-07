'use client';

/**
 * Events Page
 * v0.17.0 - Display active and upcoming community events
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  rewardXP: number;
  rewardDiamonds: number;
  imageUrl: string | null;
  participants: number;
  timeRemaining: number | null;
  timeUntilStart: number | null;
  creator: {
    id: string;
    name: string | null;
  } | null;
}

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEvents();
  }, []);

  // Update countdowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateCountdowns();
    }, 1000);

    return () => clearInterval(interval);
  }, [events]);

  const loadEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/events');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load events');
      }

      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateCountdowns = () => {
    const newCountdowns: Record<string, string> = {};
    const now = new Date().getTime();

    events.forEach(event => {
      if (event.status === 'ACTIVE' && event.timeRemaining) {
        const endTime = new Date(event.endDate).getTime();
        const diff = Math.max(0, endTime - now);
        newCountdowns[event.id] = formatTime(diff);
      } else if (event.status === 'UPCOMING' && event.timeUntilStart) {
        const startTime = new Date(event.startDate).getTime();
        const diff = Math.max(0, startTime - now);
        newCountdowns[event.id] = formatTime(diff);
      }
    });

    setCountdowns(newCountdowns);
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CHALLENGE': return '🏆';
      case 'THEMED_WEEK': return '🎨';
      case 'SPOTLIGHT': return '⭐';
      case 'COMMUNITY': return '👥';
      default: return '🎯';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-600';
      case 'UPCOMING': return 'bg-blue-500/10 text-blue-600';
      case 'ENDED': return 'bg-gray-500/10 text-gray-600';
      default: return 'bg-muted';
    }
  };

  const handleJoinEvent = (eventId: string) => {
    if (status !== 'authenticated') {
      router.push('/auth/signin');
      return;
    }

    // TODO: Implement join event logic
    alert('Event participation feature coming soon!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Events</h1>
        <p className="text-muted-foreground">
          Join challenges, themed weeks, and special events to earn rewards
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && events.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No active or upcoming events at the moment.
            </p>
            <p className="text-sm text-muted-foreground">
              Check back soon for exciting new events!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Events Grid */}
      {!loading && events.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {event.imageUrl && (
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${event.imageUrl})` }}
                />
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getEventIcon(event.type)}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {event.type.replace('_', ' ')}
                  </span>
                </div>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Countdown Timer */}
                {countdowns[event.id] && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium mb-1">
                      {event.status === 'ACTIVE' ? '⏰ Time Remaining' : '⏳ Starts In'}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {countdowns[event.id]}
                    </p>
                  </div>
                )}

                {/* Rewards */}
                {(event.rewardXP > 0 || event.rewardDiamonds > 0) && (
                  <div className="flex gap-4">
                    {event.rewardXP > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⭐</span>
                        <span className="font-semibold">{event.rewardXP} XP</span>
                      </div>
                    )}
                    {event.rewardDiamonds > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💎</span>
                        <span className="font-semibold">{event.rewardDiamonds} Diamonds</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Participants */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>👥</span>
                  <span>{event.participants} participants</span>
                </div>

                {/* Date Range */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>📅 Starts: {new Date(event.startDate).toLocaleString()}</p>
                  <p>🏁 Ends: {new Date(event.endDate).toLocaleString()}</p>
                </div>

                {/* Join Button */}
                {event.status === 'ACTIVE' && (
                  <Button 
                    className="w-full"
                    onClick={() => handleJoinEvent(event.id)}
                  >
                    Join Event
                  </Button>
                )}
                {event.status === 'UPCOMING' && (
                  <Button 
                    className="w-full"
                    variant="outline"
                    disabled
                  >
                    Coming Soon
                  </Button>
                )}
                {event.status === 'ENDED' && (
                  <Button 
                    className="w-full"
                    variant="outline"
                    disabled
                  >
                    Event Ended
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

