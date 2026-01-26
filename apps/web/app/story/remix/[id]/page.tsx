/**
 * Story Remix Creation Page
 * Create remix from existing story
 * v0.40.14 - Story Remixes 1.0
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Image, X, Repeat, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

interface RemixSource {
  panels: Array<{
    imageUrl: string;
    caption: string;
    vibeTag: string;
    microStory: string;
    role?: string | null;
  }>;
  author: {
    id: string;
    name: string | null;
    username: string | null;
  };
  panelCount: number;
  createdAt: string;
}

export default function StoryRemixPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<RemixSource | null>(null);
  const [newPanelImages, setNewPanelImages] = useState<string[]>(['']);
  const [newPanelTexts, setNewPanelTexts] = useState<(string | null)[]>(['']);
  const [uploading, setUploading] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadRemixSource();
    }
  }, [status, router, params.id]);

  async function loadRemixSource() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/story/remix/source?storyId=${params.id}`);
      const data = await res.json();
      if (data.success) {
        setSource(data);
      } else {
        setError(data.error || 'Failed to load story');
      }
    } catch (err) {
      console.error('Failed to load remix source', err);
      setError('Failed to load story. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(panelIndex: number, file: File) {
    setUploading(panelIndex);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/story/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      const newImages = [...newPanelImages];
      newImages[panelIndex] = data.imageUrl;
      setNewPanelImages(newImages);
    } catch (error) {
      console.error('Failed to upload image', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(null);
    }
  }

  function handleImageUrlChange(panelIndex: number, url: string) {
    const newImages = [...newPanelImages];
    newImages[panelIndex] = url;
    setNewPanelImages(newImages);
  }

  function handleTextChange(panelIndex: number, text: string) {
    const newTexts = [...newPanelTexts];
    newTexts[panelIndex] = text || null;
    setNewPanelTexts(newTexts);
  }

  function handleAddPanel() {
    if (newPanelImages.length >= 3) return;
    setNewPanelImages([...newPanelImages, '']);
    setNewPanelTexts([...newPanelTexts, '']);
  }

  function handleRemovePanel(index: number) {
    const newImages = newPanelImages.filter((_, i) => i !== index);
    const newTexts = newPanelTexts.filter((_, i) => i !== index);
    setNewPanelImages(newImages.length > 0 ? newImages : ['']);
    setNewPanelTexts(newTexts.length > 0 ? newTexts : ['']);
  }

  async function handleGenerateRemix() {
    const validPanels = newPanelImages.filter((url) => url.trim() !== '');
    if (validPanels.length === 0) {
      alert('Please provide at least one new panel image');
      return;
    }

    if (validPanels.length > 3) {
      alert('Maximum 3 new panels allowed');
      return;
    }

    setGenerating(true);
    try {
      const res = await apiFetch('/api/story/remix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentStoryId: params.id,
          newPanelImages: validPanels,
          newPanelTexts: newPanelTexts.slice(0, validPanels.length),
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Navigate to draft viewer
        router.push(`/story/view/${data.storyId}`);
      } else {
        alert(data.error || 'Failed to create remix');
      }
    } catch (error) {
      console.error('Failed to create remix', error);
      alert('Failed to create remix. Please try again.');
    } finally {
      setGenerating(false);
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

  if (error || !source) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-subtle mb-4">{error || 'Story not found'}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text mb-2">Remix Story</h1>
          <p className="text-subtle">Add your twist to this story</p>
        </div>

        {/* Original Story Preview */}
        <Card className="mb-6 bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">Original Story</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <span className="text-sm text-subtle">By </span>
              <span className="text-sm font-medium text-text">
                @{source.author.username || source.author.name || 'user'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {source.panels.slice(0, 4).map((panel, index) => (
                <div key={index} className="relative">
                  <img
                    src={panel.imageUrl}
                    alt={`Panel ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                </div>
              ))}
            </div>
            {source.panels.length > 4 && (
              <p className="text-xs text-subtle mt-2">+{source.panels.length - 4} more panels</p>
            )}
          </CardContent>
        </Card>

        {/* Add Your Twist */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Repeat className="w-5 h-5" />
              Add Your Twist (1-3 panels)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {newPanelImages.map((imageUrl, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text">New Panel {index + 1}</span>
                  {newPanelImages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePanel(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Image URL"
                      value={imageUrl}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      className="flex-1"
                    />
                    <input
                      ref={(el) => {
                        fileInputRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(index, file);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      disabled={uploading === index}
                    >
                      {uploading === index ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Image className="w-4 h-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                  {imageUrl && (
                    <div>
                      <img
                        src={imageUrl}
                        alt={`Panel ${index + 1} preview`}
                        className="max-w-xs max-h-48 rounded-lg border"
                      />
                    </div>
                  )}
                  <Input
                    type="text"
                    placeholder="Optional text context"
                    value={newPanelTexts[index] || ''}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                  />
                </div>
              </div>
            ))}

            {newPanelImages.length < 3 && (
              <Button variant="outline" onClick={handleAddPanel} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Panel
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateRemix}
          disabled={generating || newPanelImages.filter((url) => url.trim() !== '').length === 0}
          className="w-full"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Remix...
            </>
          ) : (
            <>
              <Repeat className="w-5 h-5 mr-2" />
              Generate Remix Story
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

