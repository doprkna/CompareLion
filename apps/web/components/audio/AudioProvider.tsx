'use client';

import { useEffect } from 'react';
import { audioManager } from '@/lib/audio/audioManager';
import { loadAudioSettings } from '@/lib/audio/audioSettings';
import { SOUND_REGISTRY } from '@/lib/audio/audioRegistry';

function unlock() {
  audioManager.userGestureUnlock();
  const s = audioManager.getSettings();
  if (s.musicEnabled && s.selectedMusicKey) {
    audioManager.playMusic(s.selectedMusicKey, { loop: true });
  }
}

export function AudioProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    audioManager.init();
    const s = loadAudioSettings();
    audioManager.setSettings(s);

    const onUnlock = () => unlock();
    document.addEventListener('pointerdown', onUnlock, { once: true });
    document.addEventListener('keydown', onUnlock, { once: true });

    const onMilestone = (e: CustomEvent<{ key?: string; variant?: string }>) => {
      const d = e.detail;
      const isLevelUp = d?.key?.includes('level_up') ?? false;
      audioManager.playSfx(isLevelUp ? 'reward.level_up' : 'reward.xp');
    };
    window.addEventListener('milestone:nudge', onMilestone as EventListener);

    return () => {
      document.removeEventListener('pointerdown', onUnlock);
      document.removeEventListener('keydown', onUnlock);
      window.removeEventListener('milestone:nudge', onMilestone as EventListener);
    };
  }, []);

  return <>{children ?? null}</>;
}
