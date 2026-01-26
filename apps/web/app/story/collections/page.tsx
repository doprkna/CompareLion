/**
 * Story Collections Page
 * View and manage story collections
 * v0.40.10 - Story Collections (Albums)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Globe, Lock, Folder } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiFetch } from '@/lib/apiBase';

interface StoryCollection {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
}

interface CollectionsResponse {
  success: boolean;
  collections: StoryCollection[];
  error?: string;
}

export default function StoryCollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collections, setCollections] = useState<StoryCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadCollections();
    }
  }, [status, router]);

  async function loadCollections() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/story/collections/mine');
      const data = (await res.json()) as CollectionsResponse;

      if (data.success) {
        setCollections(data.collections);
      }
    } catch (error) {
      console.error('Failed to load collections', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text mb-2">Story Collections</h1>
            <p className="text-subtle">Organize your stories into albums</p>
          </div>
          <Button onClick={() => router.push('/story/collections/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Collection
          </Button>
        </div>

        {collections.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Folder className="w-12 h-12 mx-auto mb-4 text-subtle" />
              <p className="text-subtle mb-4">No collections yet. Create your first collection!</p>
              <Button onClick={() => router.push('/story/collections/create')}>
                Create Collection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((collection) => (
              <Card
                key={collection.id}
                className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => router.push(`/story/collections/${collection.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text mb-1">{collection.name}</h3>
                      {collection.description && (
                        <p className="text-sm text-subtle mb-2">{collection.description}</p>
                      )}
                    </div>
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
                  </div>
                  <p className="text-xs text-subtle">
                    Created {formatDistanceToNow(new Date(collection.createdAt), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

