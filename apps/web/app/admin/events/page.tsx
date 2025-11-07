'use client';

/**
 * Admin Events Dashboard
 * v0.17.0 - CRUD for community events
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  createdAt: string;
  creator: {
    id: string;
    name: string | null;
  } | null;
}

interface EventForm {
  title: string;
  description: string;
  type: 'CHALLENGE' | 'THEMED_WEEK' | 'SPOTLIGHT' | 'COMMUNITY';
  startDate: string;
  endDate: string;
  rewardXP: string;
  rewardDiamonds: string;
  imageUrl: string;
}

export default function AdminEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    type: 'CHALLENGE',
    startDate: '',
    endDate: '',
    rewardXP: '0',
    rewardDiamonds: '0',
    imageUrl: '',
  });

  useEffect(() => {
    checkAccess();
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadEvents();
    }
  }, [status]);

  const checkAccess = async () => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/events?limit=100');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          router.push('/');
          return;
        }
        throw new Error(data.error || 'Failed to load events');
      }

      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      type: 'CHALLENGE',
      startDate: '',
      endDate: '',
      rewardXP: '0',
      rewardDiamonds: '0',
      imageUrl: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const eventData = {
        ...form,
        rewardXP: parseInt(form.rewardXP),
        rewardDiamonds: parseInt(form.rewardDiamonds),
        imageUrl: form.imageUrl || undefined,
      };

      if (editingId) {
        // Update existing event
        const response = await fetch('/api/events', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingId,
            ...eventData,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update event');
        }

        alert('Event updated successfully!');
      } else {
        // Create new event
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create event');
        }

        alert('Event created successfully!');
      }

      resetForm();
      loadEvents();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleEdit = (event: Event) => {
    setForm({
      title: event.title,
      description: event.description,
      type: event.type as any,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      rewardXP: event.rewardXP.toString(),
      rewardDiamonds: event.rewardDiamonds.toString(),
      imageUrl: event.imageUrl || '',
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete event');
      }

      alert('Event cancelled successfully!');
      loadEvents();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-600';
      case 'UPCOMING': return 'bg-blue-500/10 text-blue-600';
      case 'DRAFT': return 'bg-gray-500/10 text-gray-600';
      case 'ENDED': return 'bg-orange-500/10 text-orange-600';
      case 'CANCELLED': return 'bg-red-500/10 text-red-600';
      default: return 'bg-muted';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Events Management</h1>
          <p className="text-muted-foreground">
            Create and manage community events
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Create Event'}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm mb-6">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Event' : 'Create New Event'}</CardTitle>
            <CardDescription>
              Fill in the event details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    minLength={3}
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Event Type *</Label>
                  <select
                    id="type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="CHALLENGE">Challenge</option>
                    <option value="THEMED_WEEK">Themed Week</option>
                    <option value="SPOTLIGHT">Spotlight</option>
                    <option value="COMMUNITY">Community</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={4}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date & Time *</Label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rewardXP">Reward XP</Label>
                  <Input
                    type="number"
                    id="rewardXP"
                    value={form.rewardXP}
                    onChange={(e) => setForm({ ...form, rewardXP: e.target.value })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="rewardDiamonds">Reward Diamonds</Label>
                  <Input
                    type="number"
                    id="rewardDiamonds"
                    value={form.rewardDiamonds}
                    onChange={(e) => setForm({ ...form, rewardDiamonds: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  type="url"
                  id="imageUrl"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Update Event' : 'Create Event'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Start:</span> {new Date(event.startDate).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">End:</span> {new Date(event.endDate).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Rewards:</span> {event.rewardXP} XP, {event.rewardDiamonds} Diamonds
                </div>
                <div>
                  <span className="font-medium">Participants:</span> {event.participants}
                </div>
              </div>

              {event.status !== 'CANCELLED' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(event)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(event.id)}
                  >
                    🗑️ Cancel Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No events created yet.</p>
            <Button onClick={() => setShowForm(true)}>
              Create Your First Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
