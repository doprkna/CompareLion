'use client';

/**
 * Message Input
 * v0.20.0 - Text input for sending messages
 */

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/lib/logger';

interface MessageInputProps {
  onSend: (content: string) => void | Promise<void>;
  placeholder?: string;
  maxLength?: number;
}

export function MessageInput({ 
  onSend, 
  placeholder = 'Type a message...',
  maxLength = 1000,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      await onSend(content.trim());
      setContent(''); // Clear input after sending
    } catch (err) {
      logger.error('Error sending', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={sending}
        className="min-h-[44px] max-h-[120px] resize-none"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={!content.trim() || sending}
        size="sm"
        className="h-[44px] px-4"
      >
        {sending ? '...' : 'Send'}
      </Button>
    </div>
  );
}

