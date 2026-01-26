/**
 * Event Banner Component
 * Displays active events with effects
 * v0.36.41 - Events System 1.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Clock, Zap, Coins, Gift, Sword, Shield, Trophy } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { EventType, EventEffectType, getEventTypeDisplayName, getEffectTypeDisplayName } from '@/lib/events/types';

interface Event {
  id: string;
  name: string;
  description?: string | null;
  type: EventType;
  startAt: string;
  endAt: string;
  icon?: string | null;
  emoji?: string | null;
  effects: Array<{
    id: string;
    effectType: EventEffectType;
    value: number;
    target: string;
    description?: string | null;
  }>;
  timeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
  } | null;
  isActive: boolean;
}

interface EventBannerProps {
  className?: string;
}

export function EventBanner({ className }: EventBannerProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await apiFetch('/api/events/current');
      if ((res as any).ok && (res as any).data?.events) {
        setEvents((res as any).data.events.filter((e: Event) => e.isActive));
      }
    } catch (error) {
      console.error('Failed to load events', error);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss(eventId: string) {
    setDismissed(prev => [...prev, eventId]);
  }

  function getEffectIcon(effectType: EventEffectType) {
    switch (effectType) {
      case EventEffectType.XP_MULTIPLIER:
        return <Zap className="w-4 h-4" />;
      case EventEffectType.GOLD_MULTIPLIER:
        return <Coins className="w-4 h-4" />;
      case EventEffectType.DROP_BOOST:
        return <Gift className="w-4 h-4" />;
      case EventEffectType.DAMAGE_BUFF:
        return <Sword className="w-4 h-4" />;
      case EventEffectType.DAMAGE_NERF:
        return <Shield className="w-4 h-4" />;
      case EventEffectType.CHALLENGE_BONUS:
        return <Trophy className="w-4 h-4" />;
      default:
        return null;
    }
  }

  function formatEffectValue(effectType: EventEffectType, value: number): string {
    switch (effectType) {
      case EventEffectType.XP_MULTIPLIER:
      case EventEffectType.GOLD_MULTIPLIER:
      case EventEffectType.DAMAGE_BUFF:
        return `+${Math.round((value - 1) * 100)}%`;
      case EventEffectType.DAMAGE_NERF:
        return `-${Math.round((1 - value) * 100)}%`;
      case EventEffectType.DROP_BOOST:
        return `+${Math.round(value * 100)}%`;
      case EventEffectType.CHALLENGE_BONUS:
        return `+${value}`;
      default:
        return `${value}`;
    }
  }

  function formatTimeRemaining(timeRemaining: { days: number; hours: number; minutes: number } | null): string {
    if (!timeRemaining) return '';
    
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h remaining`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`;
    } else {
      return `${timeRemaining.minutes}m remaining`;
    }
  }

  if (loading) {
    return null;
  }

  const visibleEvents = events.filter(e => !dismissed.includes(e.id));

  if (visibleEvents.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {visibleEvents.map((event) => (
        <Card key={event.id} className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-700 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{event.emoji || event.icon || '🎉'}</span>
                  <div>
                    <h3 className="font-bold text-lg">{event.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{getEventTypeDisplayName(event.type)}</span>
                      {event.timeRemaining && (
                        <>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeRemaining(event.timeRemaining)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-300 mb-3">{event.description}</p>
                )}

                {/* Effects */}
                {event.effects.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.effects.map((effect) => (
                      <div
                        key={effect.id}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-800/50 rounded text-xs"
                      >
                        {getEffectIcon(effect.effectType)}
                        <span className="font-medium">
                          {getEffectTypeDisplayName(effect.effectType)}: {formatEffectValue(effect.effectType, effect.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(event.id)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

