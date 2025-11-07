'use client';

import { useState } from 'react';
import { useReflectionConverse, useReflectionConversation } from '@/hooks/useReflectionConverse';
import { AIResponseBubble } from './AIResponseBubble';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReflectionConversationBoxProps {
  reflectionId: string;
  reflectionContent: string;
}

export function ReflectionConversationBox({ 
  reflectionId, 
  reflectionContent 
}: ReflectionConversationBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [showInput, setShowInput] = useState(false);
  
  const { conversation, loading: loadingConv, reload } = useReflectionConversation(reflectionId);
  const { converse, loading: conversing, error } = useReflectionConverse();

  const handleDigDeeper = () => {
    setShowInput(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || conversing) return;

    try {
      await converse(reflectionId, prompt.trim());
      setPrompt('');
      setShowInput(false);
      reload(); // Reload conversation to show new response
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Dig Deeper Button */}
      {!showInput && !conversation && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDigDeeper}
          className="w-full"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          💬 Dig Deeper
        </Button>
      )}

      {/* Prompt Input */}
      {showInput && !conversation && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question about your reflection..."
            className="w-full p-3 rounded-lg border border-border bg-card text-text resize-none"
            rows={2}
            maxLength={500}
            disabled={conversing}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!prompt.trim() || conversing}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              {conversing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                'Ask AI'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowInput(false);
                setPrompt('');
              }}
              disabled={conversing}
            >
              Cancel
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </form>
      )}

      {/* Loading State */}
      {conversing && (
        <div className="flex items-center justify-center p-4 text-subtle">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Generating response...
        </div>
      )}

      {/* AI Response */}
      {conversation && !conversing && (
        <AIResponseBubble
          response={conversation.response}
          modelUsed={conversation.modelUsed}
          toneLevel={conversation.toneLevel}
        />
      )}

      {/* Loading Conversation */}
      {loadingConv && !conversation && (
        <div className="flex items-center justify-center p-4 text-subtle">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}
    </div>
  );
}

