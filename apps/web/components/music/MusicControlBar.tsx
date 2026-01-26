'use client';

import { Button } from '@/components/ui/button';
import { VolumeSlider } from './VolumeSlider';
import { NowPlayingLabel } from './NowPlayingLabel';
import { Play, Pause, VolumeX } from 'lucide-react';
import { usePlayTrack } from '@parel/core/hooks/usePlayTrack';

interface MusicControlBarProps {
  currentTrack?: any;
  isPlaying?: boolean;
  volume?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onVolumeChange?: (volume: number) => void;
  className?: string;
}

export function MusicControlBar({
  currentTrack: externalTrack,
  isPlaying: externalPlaying,
  volume: externalVolume,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  className,
}: MusicControlBarProps) {
  const trackHook = usePlayTrack();
  const currentTrack = externalTrack || trackHook.currentTrack;
  const isPlaying = externalPlaying !== undefined ? externalPlaying : trackHook.isPlaying;
  const volume = externalVolume !== undefined ? externalVolume : trackHook.volume;

  const handlePlayPause = () => {
    if (isPlaying) {
      trackHook.pause();
      onPause?.();
    } else {
      trackHook.resume();
      onPlay?.();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    trackHook.setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  const handleStop = () => {
    trackHook.stop();
    onStop?.();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <NowPlayingLabel currentTrack={currentTrack} />

      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlayPause}
        className="flex items-center gap-2"
      >
        {isPlaying ? (
          <>
            <Pause className="w-4 h-4" />
            <span className="text-xs">Pause</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span className="text-xs">Play</span>
          </>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleStop}
        className="flex items-center gap-2"
      >
        <VolumeX className="w-4 h-4" />
        <span className="text-xs">Stop</span>
      </Button>

      <VolumeSlider
        value={volume}
        onChange={handleVolumeChange}
        className="w-24"
      />
    </div>
  );
}

