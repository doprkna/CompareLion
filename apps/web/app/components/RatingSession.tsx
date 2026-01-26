/**
 * Rating Session Component
 * Batch rating mode / "Tinder Mode" session flow
 * v0.38.17 - Batch Rating Mode
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, SkipForward, CheckCircle } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { getAllCategories } from '@/lib/rating/presets';
import { RatingCard } from './RatingCard';

type SessionStep = 'setup' | 'rating' | 'summary';

interface SessionItem {
  sessionItemId: string;
  index: number;
  itemData: {
    imageUrl?: string;
    text?: string;
    category: string;
  } | null;
}

interface TasteProfile {
  metricsAvg: { [key: string]: number };
  strongPoints: string[];
  weakPoints: string[];
  aiSummary: string;
}

export function RatingSession({ className = '' }: { className?: string }) {
  const [step, setStep] = useState<SessionStep>('setup');
  const [category, setCategory] = useState<string>('snack');
  const [totalItems, setTotalItems] = useState<number>(10);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<SessionItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);

  const startSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/rating/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, totalItems }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to start session');
      }

      setSessionId(data.sessionId);
      setStep('rating');
      loadNextItem(data.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const loadNextItem = async (sid: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/rating/session/next?sessionId=${sid}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load next item');
      }

      if (data.completed) {
        // Session complete, show summary
        await loadSummary(sid);
        setStep('summary');
        return;
      }

      setCurrentItem(data.item);
      setCurrentIndex(data.item.index);
      setImageUrl('');
      setText('');
      setRequestId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load next item');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async () => {
    if (!sessionId || !currentItem) return;

    if (!imageUrl && !text.trim()) {
      setError('Please provide either an image URL or text');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create rating request
      const ratingResponse = await apiFetch('/api/rating/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          imageUrl: imageUrl || undefined,
          text: text.trim() || undefined,
        }),
      });

      const ratingData = await ratingResponse.json();

      if (!ratingResponse.ok || !ratingData.success) {
        throw new Error(ratingData.error || 'Failed to create rating');
      }

      setRequestId(ratingData.requestId);

      // Complete session item
      const completeResponse = await apiFetch('/api/rating/session/complete-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionItemId: currentItem.sessionItemId,
          requestId: ratingData.requestId,
          skipped: false,
        }),
      });

      const completeData = await completeResponse.json();

      if (!completeResponse.ok || !completeData.success) {
        throw new Error(completeData.error || 'Failed to complete item');
      }

      // Load next item
      await loadNextItem(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate item');
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!sessionId || !currentItem) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/rating/session/complete-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionItemId: currentItem.sessionItemId,
          requestId: null,
          skipped: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to skip item');
      }

      // Load next item
      await loadNextItem(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip item');
      setLoading(false);
    }
  };

  const loadSummary = async (sid: string) => {
    try {
      const response = await apiFetch(`/api/rating/session/summary?sessionId=${sid}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load summary');
      }

      setTasteProfile(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary');
    }
  };

  const resetSession = () => {
    setStep('setup');
    setSessionId(null);
    setCurrentItem(null);
    setCurrentIndex(0);
    setImageUrl('');
    setText('');
    setRequestId(null);
    setTasteProfile(null);
    setError(null);
  };

  return (
    <div className={className}>
      {step === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle>Start Rating Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAllCategories().map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="totalItems">Number of Items</Label>
              <Select
                value={totalItems.toString()}
                onValueChange={(v) => setTotalItems(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 items</SelectItem>
                  <SelectItem value="10">10 items</SelectItem>
                  <SelectItem value="20">20 items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button onClick={startSession} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Session'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'rating' && currentItem && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Item {currentIndex + 1} of {totalItems}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="text">Text Description (optional)</Label>
                <Input
                  id="text"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe the item..."
                />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              {requestId && (
                <div className="mt-4">
                  <RatingCard requestId={requestId} category={category} />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleRate}
                  disabled={loading || (!imageUrl && !text.trim())}
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : requestId ? (
                    'Next'
                  ) : (
                    'Rate'
                  )}
                </Button>
                <Button
                  onClick={handleSkip}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'summary' && tasteProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Your Taste Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">AI Summary</h3>
              <p className="text-sm text-gray-700">{tasteProfile.aiSummary}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Strong Points</h3>
              <div className="flex flex-wrap gap-2">
                {tasteProfile.strongPoints.map((point) => (
                  <span
                    key={point}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Areas to Explore</h3>
              <div className="flex flex-wrap gap-2">
                {tasteProfile.weakPoints.map((point) => (
                  <span
                    key={point}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Average Scores</h3>
              <div className="space-y-2">
                {Object.entries(tasteProfile.metricsAvg).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium">{Math.round(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={resetSession} className="w-full">
              Start Another Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

