/**
 * Tag Filter Bar Component
 * Filter questions by hashtags
 * v0.37.7 - Hashtag Filtering
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TagFilterBarProps {
  availableTags?: string[];
  className?: string;
}

export function TagFilterBar({ availableTags = [], className = '' }: TagFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    // Initialize from URL params
    const tagParam = searchParams.get('tag');
    const tagsParam = searchParams.get('tags');
    const tags: string[] = [];
    if (tagParam) tags.push(tagParam);
    if (tagsParam) tags.push(...tagsParam.split(',').map(t => t.trim()).filter(Boolean));
    setSelectedTags(tags);
  }, [searchParams]);

  const handleTagClick = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    updateURL(newTags);
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    updateURL(newTags);
  };

  const clearFilters = () => {
    setSelectedTags([]);
    updateURL([]);
  };

  const updateURL = (tags: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove existing tag params
    params.delete('tag');
    params.delete('tags');
    
    // Add new tag params
    if (tags.length === 1) {
      params.set('tag', tags[0]);
    } else if (tags.length > 1) {
      params.set('tags', tags.join(','));
    }
    
    router.push(`?${params.toString()}`);
  };

  // Common tags if none provided
  const defaultTags = availableTags.length > 0 
    ? availableTags 
    : ['health', 'tech', 'fun', 'work', 'lifestyle', 'science', 'art', 'sports'];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-subtle">Filtered by:</span>
          {selectedTags.map(tag => (
            <div
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-accent text-white"
            >
              <Hash className="h-3 w-3" />
              <span>{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:opacity-70"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-6 px-2"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Available Tags */}
      <div className="flex flex-wrap gap-2">
        {defaultTags.map(tag => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`
              inline-flex items-center gap-1 px-3 py-1.5 
              text-sm font-medium rounded-full
              border transition-colors
              ${
                selectedTags.includes(tag)
                  ? 'bg-accent border-accent text-white'
                  : 'bg-card border-border text-subtle hover:text-text hover:border-accent'
              }
            `}
          >
            <Hash className="h-3 w-3" />
            <span>{tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

