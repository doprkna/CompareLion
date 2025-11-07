'use client';

/**
 * UGC Creation Page
 * v0.17.0 - User-generated content submission
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SubmissionForm {
  title: string;
  content: string;
  description: string;
  categoryId: string;
  imageUrl: string;
  type: 'QUESTION' | 'PACK' | 'EVENT';
}

export default function CreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState<SubmissionForm>({
    title: '',
    content: '',
    description: '',
    categoryId: '',
    imageUrl: '',
    type: 'QUESTION',
  });

  const [availableTags, setAvailableTags] = useState<{ tone: Array<{ id: string; name: string }>; content: Array<{ id: string; name: string }> }>({ tone: [], content: [] });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await fetch('/api/tags');
        const data = await res.json();
        if (data?.success && data?.tags) {
          setAvailableTags({
            tone: data.tags.tone || [],
            content: data.tags.content || [],
          });
        }
      } catch {}
    };
    loadTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tags = selectedTags;

      const response = await fetch('/api/ugc/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          tags,
          categoryId: form.categoryId || undefined,
          imageUrl: form.imageUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      setSuccess(data.message);
      
      // Reset form
      setForm({
        title: '',
        content: '',
        description: '',
        categoryId: '',
        imageUrl: '',
        type: 'QUESTION',
      });
      setSelectedTags([]);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/community');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You must be logged in to create content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/auth/signin')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Content</CardTitle>
          <CardDescription>
            Share your questions, packs, or event ideas with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div>
              <Label htmlFor="type">Content Type</Label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="QUESTION">Question</option>
                <option value="PACK">Question Pack</option>
                <option value="EVENT">Event Idea</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter a descriptive title (10-300 characters)"
                required
                minLength={10}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.title.length}/300 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Content *</Label>
              <textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Enter your question or content (10-300 characters)"
                required
                minLength={10}
                maxLength={300}
                rows={4}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.content.length}/300 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional context or explanation"
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.description.length}/500 characters
              </p>
            </div>

            {/* Tags (Multi-select) */}
            <div>
              <Label>Tags (Optional)</Label>
              <div className="mt-2 grid grid-cols-1 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Tone</div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.tone.map((t) => {
                      const checked = selectedTags.includes(t.name);
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => {
                            setSelectedTags((prev) =>
                              checked ? prev.filter((n) => n !== t.name) : [...prev, t.name]
                            );
                          }}
                          className={`px-2 py-1 rounded border text-xs ${
                            checked ? 'bg-accent text-white border-accent' : 'border-border'
                          }`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Content</div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.content.map((t) => {
                      const checked = selectedTags.includes(t.name);
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => {
                            setSelectedTags((prev) =>
                              checked ? prev.filter((n) => n !== t.name) : [...prev, t.name]
                            );
                          }}
                          className={`px-2 py-1 rounded border text-xs ${
                            checked ? 'bg-accent text-white border-accent' : 'border-border'
                          }`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {selectedTags.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Selected: {selectedTags.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-md bg-green-500/10 text-green-600 text-sm">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>

            {/* Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>📝 All submissions are reviewed by moderators before going live.</p>
              <p>⭐ Earn 15 XP for your first approved submission!</p>
              <p>🎯 Get 5 XP for each upvote on your content.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

