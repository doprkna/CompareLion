/**
 * Create Story Collection Page
 * Create new story collection
 * v0.40.10 - Story Collections (Albums)
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Globe, Lock } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

export default function CreateCollectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  async function handleCreateCollection() {
    if (!name.trim()) {
      alert('Please enter a collection name');
      return;
    }

    setCreating(true);
    try {
      const res = await apiFetch('/api/story/collections/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          isPublic,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/story/collections/${data.collection.id}`);
      } else {
        alert(data.error || 'Failed to create collection');
      }
    } catch (error) {
      console.error('Failed to create collection', error);
      alert('Failed to create collection. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text mb-2">Create Collection</h1>
          <p className="text-subtle">Organize your stories into albums</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-text">Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Pet Chaos, My Desk Glow-Ups"
                className="bg-bg border-border text-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-text">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="bg-bg border-border text-text"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="isPublic" className="text-sm text-text flex items-center gap-2">
                {isPublic ? (
                  <>
                    <Globe className="w-4 h-4" />
                    Make public (others can view this collection)
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Keep private (only you can view)
                  </>
                )}
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCollection}
                disabled={creating || !name.trim()}
                className="flex-1"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Collection'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

