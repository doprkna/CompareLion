'use client';

/**
 * My Reflection Card
 * v0.19.5 - Display personalized AI reflections
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface Reflection {
  id: string;
  type: string;
  content: string;
  summary: string | null;
  sentiment: string;
  date: string;
  createdAt: string;
}

export function MyReflectionCard() {
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchLatestReflection();
  }, []);

  const fetchLatestReflection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reflection/latest');
      if (response.ok) {
        const data = await response.json();
        setReflection(data.reflection);
      }
    } catch (error) {
      logger.error('Failed to fetch reflection', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewReflection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'DAILY' }),
      });

      if (response.ok) {
        await fetchLatestReflection();
        // Show toast notification
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast('Reflection updated! 🎉', 'success');
        }
      }
    } catch (error) {
      logger.error('Failed to generate reflection', error);
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😔';
      default:
        return '😐';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'negative':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'DAILY':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'WEEKLY':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'MONTHLY':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'MILESTONE':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && !reflection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Reflection</CardTitle>
          <CardDescription>Loading your insight...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reflection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Reflection</CardTitle>
          <CardDescription>Your personalized insight</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No reflection yet. Generate your first one!
            </p>
            <Button onClick={generateNewReflection} disabled={loading}>
              Generate Reflection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-300 ${getSentimentColor(reflection.sentiment)}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>My Reflection</span>
              <span className="text-2xl">{getSentimentEmoji(reflection.sentiment)}</span>
            </CardTitle>
            <CardDescription>{formatDate(reflection.createdAt)}</CardDescription>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeBadgeColor(reflection.type)}`}>
            {reflection.type}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose dark:prose-invert max-h-32 overflow-y-auto text-sm">
          {reflection.content.split('\n').map((line, idx) => (
            <p key={idx} className="mb-2 last:mb-0">
              {line}
            </p>
          ))}
        </div>

        {/* AI Conversation Box */}
        {reflection.id && (
          <ReflectionConversationBox
            reflectionId={reflection.id}
            reflectionContent={reflection.content}
          />
        )}

        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={generateNewReflection}
            disabled={loading}
          >
            🔄 Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            📖 History
          </Button>
        </div>

        {showHistory && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground text-center">
              Full reflection history coming soon! 
              <br />
              <span className="text-xs">Check /api/reflection/latest for your latest insights.</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

