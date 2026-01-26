'use client';

import { useCallback, useRef } from 'react';
import { MusicTheme } from '../config/musicThemes'; // sanity-fix

export function useFadeTransition() {
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fadeOut = useCallback((audio: HTMLAudioElement, duration: number, onComplete: () => void) => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const startVolume = audio.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = startVolume / steps;

    let currentStep = 0;
    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(0, startVolume - volumeStep * currentStep);

      if (currentStep >= steps) {
        audio.volume = 0;
        audio.pause();
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
        onComplete();
      }
    }, stepDuration);
  }, []);

  const fadeIn = useCallback((audio: HTMLAudioElement, duration: number, targetVolume: number) => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;
    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(targetVolume, volumeStep * currentStep);

      if (currentStep >= steps) {
        audio.volume = targetVolume;
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
      }
    }, stepDuration);
  }, []);

  const transition = useCallback(
    (
      currentAudio: HTMLAudioElement | null,
      nextTheme: MusicTheme,
      nextAudio: HTMLAudioElement,
      onComplete: () => void
    ) => {
      if (currentAudio) {
        fadeOut(currentAudio, nextTheme.transitionFade, () => {
          nextAudio.play().then(() => {
            fadeIn(nextAudio, nextTheme.transitionFade, nextTheme.volumeDefault);
            onComplete();
          });
        });
      } else {
        nextAudio.play().then(() => {
          fadeIn(nextAudio, nextTheme.transitionFade, nextTheme.volumeDefault);
          onComplete();
        });
      }
    },
    [fadeOut, fadeIn]
  );

  return { fadeOut, fadeIn, transition };
}

