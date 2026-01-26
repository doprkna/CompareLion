/**
 * Question Insights Component
 * Displays basic analytics for a question
 * v0.37.6 - Question Insights (Basic)
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionInsights {
  answerCount: number;
  avgAnswerLength: number;
  avgResponseTime: number; // milliseconds
  skipRate: number; // percentage (0-100)
  maxAnswerLength?: number;
  minAnswerLength?: number;
}

interface QuestionInsightsProps {
  questionId: string;
  className?: string;
}

/**
 * Format milliseconds to human-readable time
 */
function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function QuestionInsights({ questionId, className = '' }: QuestionInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [insights, setInsights] = useState<QuestionInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!questionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/questions/insights?questionId=${encodeURIComponent(questionId)}`);
      const data = await response.json();
      
      if (data.success && data.insights) {
        setInsights(data.insights);
      } else {
        setError('Failed to load insights');
      }
    } catch (err) {
      setError('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && !insights && !loading) {
      fetchInsights();
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
          <BarChart3 className="h-4 w-4" />
          <span>Insights</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="mt-3 space-y-2 text-sm">
          {loading && (
            <div className="text-subtle text-center py-2">Loading insights...</div>
          )}
          
          {error && (
            <div className="text-red-500 text-center py-2">{error}</div>
          )}
          
          {insights && !loading && !error && (
            <div className="space-y-2 text-subtle">
              <div className="flex justify-between">
                <span>Total Answers:</span>
                <span className="text-text font-medium">{insights.answerCount}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Avg Answer Length:</span>
                <span className="text-text font-medium">{insights.avgAnswerLength.toFixed(0)} chars</span>
              </div>
              
              {insights.maxAnswerLength !== undefined && insights.minAnswerLength !== undefined && (
                <div className="flex justify-between text-xs">
                  <span>Length Range:</span>
                  <span className="text-text">
                    {insights.minAnswerLength} - {insights.maxAnswerLength} chars
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Avg Response Time:</span>
                <span className="text-text font-medium">
                  {formatResponseTime(insights.avgResponseTime)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Skip Rate:</span>
                <span className="text-text font-medium">{insights.skipRate.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

