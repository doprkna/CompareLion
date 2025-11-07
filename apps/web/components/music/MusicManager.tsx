'use client';

import { useEffect, useRef, useState } from 'react';
import { useMusicTheme } from '@/hooks/useMusicTheme';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import { MusicControlBar } from './MusicControlBar';
import { MusicTheme } from '@/lib/music/musicThemes';
import { useGlobalMood } from '@/hooks/useGlobalMood';

interface MusicManagerProps {
  enabled?: boolean;
  regionKey?: string;
  archetypeKey?: string;
  onTrackChange?: (theme: MusicTheme | null) => void;
}

/**
 * MusicManager Component
 * v0.29.18 - Interactive Music Layer
 * Global music manager controlling playback via AudioContext
 */
export function MusicManager({
  enabled = true,
  regionKey,
  archetypeKey,
  onTrackChange,
}: MusicManagerProps) {
  const { themes, loading, getThemeByMood, getThemeByRegion, getThemeByArchetype } = useMusicTheme();
  const { mood } = useGlobalMood();
  const { play, stop, pause, resume, setVolume, currentTrack, isPlaying } = usePlayTrack();
  const [adaptiveMusicEnabled, setAdaptiveMusicEnabled] = useState(true);
  const currentThemeRef = useRef<MusicTheme | null>(null);

  // Get user preference for adaptive music (from settings)
  useEffect(() => {
    const saved = localStorage.getItem('parel-adaptive-music');
    if (saved !== null) {
      setAdaptiveMusicEnabled(saved === 'true');
    }
  }, []);

  // Auto-switch music based on mood, region, or archetype
  useEffect(() => {
    if (!enabled || !adaptiveMusicEnabled || loading || themes.length === 0) {
      return;
    }

    let targetTheme: MusicTheme | null = null;

    // Priority: region > archetype > mood
    if (regionKey) {
      targetTheme = getThemeByRegion(regionKey);
    } else if (archetypeKey) {
      targetTheme = getThemeByArchetype(archetypeKey);
    } else if (mood?.dominantEmotion) {
      // Map global mood to music mood tag
      const moodMap: Record<string, 'calm' | 'chaos' | 'joy' | 'deep' | 'battle'> = {
        calm: 'calm',
        joy: 'joy',
        hope: 'joy',
        sad: 'deep',
        anger: 'chaos',
        chaos: 'chaos',
      };
      const musicMood = moodMap[mood.dominantEmotion] || 'calm';
      targetTheme = getThemeByMood(musicMood);
    } else {
      // Fallback to calm
      targetTheme = getThemeByMood('calm');
    }

    if (targetTheme && targetTheme.key !== currentThemeRef.current?.key) {
      // Use playTrack hook which handles transitions
      play(targetTheme);
      currentThemeRef.current = targetTheme;
      onTrackChange?.(targetTheme);
    }
  }, [enabled, adaptiveMusicEnabled, loading, themes, regionKey, archetypeKey, mood, getThemeByMood, getThemeByRegion, getThemeByArchetype, play, onTrackChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Don't render anything if disabled or not loaded
  if (!enabled || loading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <MusicControlBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        volume={volume}
        onPlay={() => resume()}
        onPause={() => pause()}
        onStop={() => stop()}
        onVolumeChange={setVolume}
        className="bg-card border border-border rounded-lg p-2 shadow-lg"
      />
    </div>
  );
}

