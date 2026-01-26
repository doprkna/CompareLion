/**
 * Question Tags Component
 * Displays hashtags as pill-style labels
 * v0.37.7 - Hashtag Filtering
 */

'use client';

import { Hash } from 'lucide-react';

interface QuestionTagsProps {
  tags?: string[] | null;
  onClick?: (tag: string) => void;
  className?: string;
}

export function QuestionTags({ tags, onClick, className = '' }: QuestionTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => (
        <button
          key={index}
          onClick={() => onClick?.(tag)}
          className={`
            inline-flex items-center gap-1 px-2 py-1 
            text-xs font-medium rounded-full
            bg-card border border-border
            text-subtle hover:text-text hover:border-accent
            transition-colors
            ${onClick ? 'cursor-pointer' : 'cursor-default'}
          `}
        >
          <Hash className="h-3 w-3" />
          <span>{tag}</span>
        </button>
      ))}
    </div>
  );
}

