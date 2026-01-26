/**
 * Story Collection Detail Page
 * View collection and manage stories
 * v0.40.10 - Story Collections (Albums)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Plus,
  X,
  Globe,
  Lock,
  Heart,
  Laugh,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiFetch } from '@/lib/apiBase';

interface CollectionStory {
  itemId: string;
  storyId: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
  };
  coverImageUrl: string | null;
  createdAt: string;
  reactions: {
    like: number;
    lol: number;
    vibe: number;
  };
  stickers: Array<{
    id: string;
    emoji: string;
    count: number;
  }>;
}

interface MyStory {
  id: string;
  type: string;
  coverImageUrl: string | null;
  visibility: string;
  createdAt: string;
}

interface CollectionResponse {
  success: boolean;
  collection: {
    id: string;
    userId: string;
    name: string;
    description: string;
    isPublic: boolean;
    createdAt: string;
  };
  stories: CollectionStory[];
  error?: string;
}

export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionResponse['collection'] | null>(null);
  const [stories, setStories] = useState<CollectionStory[]>([]);
  const [myStories, setMyStories] = useState<MyStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadCollection();
      checkOwnership();
    }
  }, [status, router, params.id]);

  async function checkOwnership() {
    try {
      const res = await apiFetch('/api/story/collections/mine');
      const data = await res.json();
      if (data.success) {
        const ownsCollection = data.collections.some((c: { id: string }) => c.id === params.id);
        setIsOwner(ownsCollection);
      }
    } catch (error) {
      console.error('Failed to check ownership', error);
    }
  }

  async function loadCollection() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/story/collections/${params.id}`);
      const data = (await res.json()) as CollectionResponse;

      if (data.success) {
        setCollection(data.collection);
        // Add itemId to stories (we'll need to fetch this separately or modify API)
        setStories(data.stories);
      }
    } catch (error) {
      console.error('Failed to load collection', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMyStories() {
    try {
      const res = await apiFetch('/api/story/mine');
      const data = await res.json();
      if (data.success) {
        // Filter to stories not already in collection
        const storyIdsInCollection = new Set(stories.map((s) => s.storyId));
        const availableStories = data.stories.filter(
          (s: MyStory) => !storyIdsInCollection.has(s.id)
        );
        setMyStories(availableStories);
      }
    } catch (error) {
      console.error('Failed to load my stories', error);
    }
  }

  async function handleAddStory() {
    if (!selectedStoryId) return;

    setAdding(true);
    try {
      const res = await apiFetch('/api/story/collections/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId: params.id,
          storyId: selectedStoryId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setSelectedStoryId(null);
        // Reload collection
        loadCollection();
      } else {
        alert(data.error || 'Failed to add story');
      }
    } catch (error) {
      console.error('Failed to add story', error);
      alert('Failed to add story. Please try again.');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveStory(storyId: string) {
    const itemId = stories.find((s) => s.storyId === storyId)?.itemId;
    if (!itemId) {
      alert('Cannot remove: item ID not found');
      return;
    }

    setRemoving((prev) => new Set(prev).add(itemId));
    try {
      const res = await apiFetch('/api/story/collections/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();
      if (data.success) {
        // Reload collection
        loadCollection();
      } else {
        alert(data.error || 'Failed to remove story');
      }
    } catch (error) {
      console.error('Failed to remove story', error);
      alert('Failed to remove story. Please try again.');
    } finally {
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }

  function handleStoryClick(storyId: string) {
    router.push(`/story/view/${storyId}`);
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-subtle" />
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-subtle">Collection not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* Collection Header */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{collection.name}</CardTitle>
                {collection.description && (
                  <p className="text-subtle mb-2">{collection.description}</p>
                )}
                <div className="flex items-center gap-2">
                  {collection.isPublic ? (
                    <Badge className="text-xs bg-green-100 text-green-700">
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                  )}
                  <span className="text-xs text-subtle">
                    {stories.length} {stories.length === 1 ? 'story' : 'stories'}
                  </span>
                </div>
              </div>
              {isOwner && (
                <Button
                  onClick={() => {
                    setShowAddModal(true);
                    loadMyStories();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Story
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-subtle mb-4">No stories in this collection yet.</p>
              {isOwner && (
                <Button onClick={() => {
                  setShowAddModal(true);
                  loadMyStories();
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Story
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story) => (
              <Card
                key={story.storyId}
                className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors relative"
                onClick={() => handleStoryClick(story.storyId)}
              >
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStory(story.storyId);
                    }}
                    disabled={removing.has(story.itemId)}
                  >
                    {removing.has(story.itemId) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <CardContent className="p-4">
                  {story.coverImageUrl && (
                    <div className="mb-3">
                      <img
                        src={story.coverImageUrl}
                        alt="Story cover"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-text">
                      {story.user.username || story.user.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-subtle ml-auto">
                      {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-subtle">
                      ❤️ {story.reactions.like} 😄 {story.reactions.lol} ✨ {story.reactions.vibe}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Story Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-card border-border max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Add Story to Collection</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedStoryId(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {myStories.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-subtle mb-4">
                      No available stories to add. Create a story first!
                    </p>
                    <Button onClick={() => router.push('/story/create')}>
                      Create Story
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myStories.map((story) => (
                      <Card
                        key={story.id}
                        className={`cursor-pointer transition-colors ${
                          selectedStoryId === story.id
                            ? 'border-primary bg-primary/10'
                            : 'bg-card border-border'
                        }`}
                        onClick={() => setSelectedStoryId(story.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            {story.coverImageUrl && (
                              <img
                                src={story.coverImageUrl}
                                alt="Story cover"
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {story.type}
                                </Badge>
                                {story.visibility === 'public' && (
                                  <Globe className="w-3 h-3 text-green-600" />
                                )}
                              </div>
                              <p className="text-xs text-subtle mt-1">
                                {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            {selectedStoryId === story.id && (
                              <div className="text-primary">✓</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
              {myStories.length > 0 && (
                <div className="p-4 border-t border-border flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedStoryId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleAddStory}
                    disabled={!selectedStoryId || adding}
                  >
                    {adding ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Story'
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

