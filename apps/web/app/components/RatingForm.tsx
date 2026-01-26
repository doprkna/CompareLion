/**
 * Rating Form Component
 * Submit content for AI rating
 * v0.38.1 - AI Universal Rating Engine
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/apiBase';
import { getAllCategories, getCategoryPreset } from '@/lib/rating/presets';
import { RatingCard } from './RatingCard';

interface RatingFormProps {
  className?: string;
}

export function RatingForm({ className = '' }: RatingFormProps) {
  const [category, setCategory] = useState<string>('snack');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl && !text.trim()) {
      setError('Please provide either an image URL or text description');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch('/api/rating/create', {
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create rating request');
      }

      setRequestId(data.requestId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const preset = getCategoryPreset(category);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Get AI Rating</CardTitle>
          <CardDescription>
            Submit content for AI evaluation and get category-specific scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Select */}
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                disabled={isSubmitting}
              >
                {getAllCategories().map((cat) => {
                  const catPreset = getCategoryPreset(cat);
                  return (
                    <option key={cat} value={cat}>
                      {catPreset?.name || cat}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Image URL */}
            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
            </div>

            {/* Text */}
            <div>
              <Label htmlFor="text">Text Description (optional)</Label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe your content..."
                className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                disabled={isSubmitting}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {text.length}/500 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || (!imageUrl && !text.trim())}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Get Rating'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Rating Results */}
      {requestId && (
        <div className="mt-4">
          <RatingCard requestId={requestId} category={category} />
        </div>
      )}
    </div>
  );
}

