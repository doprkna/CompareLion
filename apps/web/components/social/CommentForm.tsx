'use client';

/**
 * Comment Form
 * v0.20.0 - Form for submitting comments
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/lib/logger';

interface CommentFormProps {
  onSubmit: (content: string) => void | Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  maxLength?: number;
}

export function CommentForm({ 
  onSubmit, 
  onCancel,
  placeholder = 'Share your thoughts...',
  maxLength = 500,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent(''); // Clear input after submitting
    } catch (err) {
      logger.error('Error submitting comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={submitting}
        className="min-h-[80px] resize-none"
        rows={3}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length} / {maxLength}
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            size="sm"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </div>
    </div>
  );
}

