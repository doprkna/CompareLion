'use client';

import { useState, useEffect } from 'react';
import { audioManager } from '@/lib/audio/audioManager';
import { loadAudioSettings, type AudioSettings } from '@/lib/audio/audioSettings';
import { SOUND_REGISTRY } from '@/lib/audio/audioRegistry';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AudioSettingsPanel() {
  const [s, setS] = useState<AudioSettings>(() =>
    typeof window !== 'undefined' ? loadAudioSettings() : audioManager.getSettings()
  );

  useEffect(() => {
    setS(audioManager.getSettings());
  }, []);

  const update = (partial: Partial<AudioSettings>) => {
    const next = { ...s, ...partial };
    setS(next);
    audioManager.setSettings(next);
  };

  const musicKeys = Object.keys(SOUND_REGISTRY.music);

  return (
    <div className="space-y-4 max-w-sm">
      <div className="flex items-center justify-between">
        <Label>Silent mode (master mute)</Label>
        <Switch checked={s.masterMuted} onCheckedChange={(v) => update({ masterMuted: v })} />
      </div>
      <div className="flex items-center justify-between">
        <Label>Music</Label>
        <Switch checked={s.musicEnabled} onCheckedChange={(v) => update({ musicEnabled: v })} />
      </div>
      {s.musicEnabled && (
        <>
          <div>
            <Label className="text-xs text-subtle">Music volume</Label>
            <Slider
              value={[s.musicVolume]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([v]) => update({ musicVolume: v })}
            />
          </div>
          <div>
            <Label className="text-xs text-subtle">Music pack</Label>
            <Select
              value={s.selectedMusicKey}
              onValueChange={(v) => update({ selectedMusicKey: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {musicKeys.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      <div className="flex items-center justify-between">
        <Label>SFX</Label>
        <Switch checked={s.sfxEnabled} onCheckedChange={(v) => update({ sfxEnabled: v })} />
      </div>
      {s.sfxEnabled && (
        <div>
          <Label className="text-xs text-subtle">SFX volume</Label>
          <Slider
            value={[s.sfxVolume]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([v]) => update({ sfxVolume: v })}
          />
        </div>
      )}
    </div>
  );
}
