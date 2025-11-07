'use client';

/**
 * Flagged List
 * v0.20.1 - Display flagged content with filters
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModerationActions } from './ModerationActions';

interface FlaggedItem {
  type: string;
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  flagCount: number;
}

export function FlaggedList() {
  const [flagged, setFlagged] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchFlagged();
  }, [filter]);

  const fetchFlagged = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? '/api/moderation/flagged'
        : `/api/moderation/flagged?type=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFlagged(data.flagged || []);
      }
    } catch (err) {
      console.error('Failed to fetch flagged content:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'comment':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'reflection':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flagged Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Flagged Content ({flagged.length})</CardTitle>
          <div className="flex gap-2">
            {['all', 'message', 'comment', 'reflection'].map((type) => (
              <Button
                key={type}
                onClick={() => setFilter(type)}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {type !== 'all' && `s`}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {flagged.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✨</div>
            <p className="text-muted-foreground">No flagged content</p>
            <p className="text-sm text-muted-foreground mt-1">Everything looks clean!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flagged.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Type Badge */}
                  <div className={`px-3 py-1 rounded text-xs font-semibold ${getTypeColor(item.type)}`}>
                    {item.type.toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-2 line-clamp-2 break-words">
                      {item.content.length > 100 
                        ? item.content.substring(0, 100) + '...' 
                        : item.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span>👤 {item.author}</span>
                      <span>📅 {formatDate(item.createdAt)}</span>
                      <span>🚩 {item.flagCount} flag(s)</span>
                    </div>
                    
                    {/* Actions */}
                    <ModerationActions
                      targetType={item.type}
                      targetId={item.id}
                      authorId={item.authorId}
                      onActionComplete={fetchFlagged}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

