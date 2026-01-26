/**
 * Question Summary Component
 * Displays AI-generated summary of question answers
 * v0.37.8 - AI Summary Snippet
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionSummaryProps {
  questionId: string;
  className?: string;
}

export function QuestionSummary({ questionId, className = '' }: QuestionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (!questionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/questions/summary?questionId=${encodeURIComponent(questionId)}`);
      const data = await response.json();
      
      if (data.success && data.summary) {
        setSummary(data.summary);
      } else {
        setError('Failed to load summary');
      }
    } catch (err) {
      setError('Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && !summary && !loading) {
      fetchSummary();
    }
  }, [isExpanded, questionId]);

  if (!questionId) return null;

  return (
    <div className={`border-t border-border pt-3 mt-3 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm text-subtle hover:text-text"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>AI Summary</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="mt-3">
          {loading && (
            <div className="flex items-center gap-2 text-subtle py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating summary...</span>
            </div>
          )}
          
          {error && (
            <div className="text-red-500 text-sm py-2">{error}</div>
          )}
          
          {summary && !loading && !error && (
            <div className="text-sm text-text leading-relaxed">
              <p>{summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

