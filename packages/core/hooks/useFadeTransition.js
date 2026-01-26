'use client';
// sanity-fix
'use client';
import { useCallback, useRef } from 'react';
export function useFadeTransition() {
    const fadeIntervalRef = useRef(null);
    const fadeOut = useCallback((audio, duration, onComplete) => {
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
    const fadeIn = useCallback((audio, duration, targetVolume) => {
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
    const transition = useCallback((currentAudio, nextTheme, nextAudio, onComplete) => {
        if (currentAudio) {
            fadeOut(currentAudio, nextTheme.transitionFade, () => {
                nextAudio.play().then(() => {
                    fadeIn(nextAudio, nextTheme.transitionFade, nextTheme.volumeDefault);
                    onComplete();
                });
            });
        }
        else {
            nextAudio.play().then(() => {
                fadeIn(nextAudio, nextTheme.transitionFade, nextTheme.volumeDefault);
                onComplete();
            });
        }
    }, [fadeOut, fadeIn]);
    return { fadeOut, fadeIn, transition };
}