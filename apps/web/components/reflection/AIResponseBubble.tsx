'use client';

import { MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIResponseBubbleProps {
  response: string;
  modelUsed?: string | null;
  toneLevel?: number;
}

export function AIResponseBubble({ response, modelUsed, toneLevel }: AIResponseBubbleProps) {
  const isGPT = modelUsed?.includes('gpt') || modelUsed === 'gpt-4';
  const isPremium = isGPT;

  return (
    <div className={cn(
      'relative mt-4 p-4 rounded-lg border-2',
      isPremium 
        ? 'bg-accent/10 border-accent/30' 
        : 'bg-card/50 border-border'
    )}>
      {/* AI Avatar Icon */}
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isPremium ? 'bg-accent/20' : 'bg-card border border-border'
        )}>
          {isPremium ? (
            <Sparkles className="w-4 h-4 text-accent" />
          ) : (
            <MessageSquare className="w-4 h-4 text-subtle" />
          )}
        </div>

        {/* Response Content */}
        <div className="flex-1 min-w-0">
          {/* Premium Badge */}
          {isPremium && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30">
                AI Insights
              </span>
            </div>
          )}

          {/* Response Text */}
          <p className="text-text whitespace-pre-wrap leading-relaxed">{response}</p>

          {/* Model Info */}
          {modelUsed && (
            <div className="mt-2 text-xs text-subtle">
              {isGPT ? 'Powered by GPT-4' : 'Local response'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

