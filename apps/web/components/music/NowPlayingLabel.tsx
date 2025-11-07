'use client';

import { MusicTheme } from '@/lib/music/musicThemes';
import { Music } from 'lucide-react';

interface NowPlayingLabelProps {
  currentTrack: MusicTheme | null;
}

export function NowPlayingLabel({ currentTrack }: NowPlayingLabelProps) {
  if (!currentTrack) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Music className="w-4 h-4" />
        <span>No track playing</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Music className="w-4 h-4 text-primary" />
      <div className="flex flex-col">
        <span className="font-semibold text-xs">{currentTrack.name}</span>
        <span className="text-xs text-muted-foreground capitalize">{currentTrack.moodTag}</span>
      </div>
    </div>
  );
}

