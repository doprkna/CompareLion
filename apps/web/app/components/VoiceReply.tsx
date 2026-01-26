/**
 * Voice Reply Component
 * Display voice replies with audio player
 * v0.37.9 - Voice Replies
 */

'use client';

import { Volume2 } from 'lucide-react';

interface VoiceReplyProps {
  audioUrl: string;
  className?: string;
}

export function VoiceReply({ audioUrl, className = '' }: VoiceReplyProps) {
  if (!audioUrl) return null;

  return (
    <div className={`flex items-center gap-2 p-3 bg-card border border-border rounded-lg ${className}`}>
      <Volume2 className="h-5 w-5 text-accent flex-shrink-0" />
      <audio
        src={audioUrl}
        controls
        className="flex-1"
        preload="metadata"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

