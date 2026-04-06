/**
 * Audio settings - localStorage persistence
 */
const LS_KEY = 'parel:audio';

export interface AudioSettings {
  masterMuted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  selectedMusicKey: string;
}

export function getDefaultAudioSettings(): AudioSettings {
  return {
    masterMuted: false,
    musicEnabled: false,
    sfxEnabled: true,
    musicVolume: 0.6,
    sfxVolume: 0.6,
    selectedMusicKey: 'music.therapy.lofi',
  };
}

export function loadAudioSettings(): AudioSettings {
  if (typeof window === 'undefined') return getDefaultAudioSettings();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return getDefaultAudioSettings();
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    const def = getDefaultAudioSettings();
    return {
      masterMuted: parsed.masterMuted ?? def.masterMuted,
      musicEnabled: parsed.musicEnabled ?? def.musicEnabled,
      sfxEnabled: parsed.sfxEnabled ?? def.sfxEnabled,
      musicVolume: Math.max(0, Math.min(1, parsed.musicVolume ?? def.musicVolume)),
      sfxVolume: Math.max(0, Math.min(1, parsed.sfxVolume ?? def.sfxVolume)),
      selectedMusicKey: parsed.selectedMusicKey ?? def.selectedMusicKey,
    };
  } catch {
    return getDefaultAudioSettings();
  }
}

export function saveAudioSettings(s: AudioSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {}
}
