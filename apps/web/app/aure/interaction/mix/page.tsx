/**
 * AURE Interaction Engine - Mix Mode Page 2.0
 * Multi-image vibe story generator
 * v0.39.8 - Mix Mode 2.0 (Multi-Image Vibe Story)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Download, Check } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

interface RatingHistoryItem {
  id: string;
  category: string;
  createdAt: string;
  hasResult: boolean;
}

interface MixResult {
  story: string;
  labels: string[];
  moodScore: number;
  collageId: string;
  requestIds: string[];
}

export default function MixModePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<RatingHistoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<MixResult | null>(null);
  const [collageUrl, setCollageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadHistory();
    }
  }, [status, router]);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/rating/history?limit=50');
      if ((res as any).ok && (res as any).data?.history) {
        // Only show items with results
        const itemsWithResults = (res as any).data.history.filter((item: RatingHistoryItem) => item.hasResult);
        setHistory(itemsWithResults);
      }
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelection(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (newSelected.size >= 6) {
        return; // Max 6 items
      }
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  async function handleGenerate() {
    if (selectedIds.size < 2) {
      alert('Please select at least 2 items');
      return;
    }

    setGenerating(true);
    setResult(null);
    setCollageUrl(null);

    try {
      const res = await apiFetch('/api/aure/interaction/mix/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestIds: Array.from(selectedIds),
        }),
      });

      if ((res as any).ok && (res as any).data) {
        const data = (res as any).data;
        setResult({
          story: data.story,
          labels: data.labels || [],
          moodScore: data.moodScore || 50,
          collageId: data.collageId,
          requestIds: data.requestIds || Array.from(selectedIds),
        });

        // Generate collage URL
        const collageUrl = `/api/aure/interaction/mix/collage?collageId=${data.collageId}`;
        setCollageUrl(collageUrl);
      } else {
        throw new Error('Failed to generate mix story');
      }
    } catch (error) {
      console.error('Failed to generate mix', error);
      alert('Failed to generate mix story. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  function handleShareCollage() {
    if (!collageUrl) return;

    // Open in new tab to trigger download
    window.open(collageUrl, '_blank');
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8" />
          Mix Mode
        </h1>
        <p className="text-gray-600">Select 2-6 rated items to create a vibe story</p>
      </div>

      {/* Selection Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Items ({selectedIds.size}/6)</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-gray-500">No rated items yet. Rate some items first!</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium capitalize">{item.category}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="mb-6">
        <Button
          onClick={handleGenerate}
          disabled={selectedIds.size < 2 || generating}
          className="w-full"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Vibe Story...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Vibe Story
            </>
          )}
        </Button>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-6">
          {/* Collage Preview */}
          {collageUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Collage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <img
                    src={collageUrl}
                    alt="Mix collage"
                    className="w-full rounded-lg border"
                  />
                </div>
                <Button onClick={handleShareCollage} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Share Image
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Vibe Story */}
          <Card>
            <CardHeader>
              <CardTitle>Vibe Story</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line mb-4">{result.story}</p>

              {/* Mood Labels */}
              {result.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.labels.map((label, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {/* Mood Score */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Mood Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full"
                      style={{ width: `${result.moodScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{result.moodScore}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

