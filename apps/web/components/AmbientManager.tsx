/**
 * Ambient Environment Manager
 * Provides dynamic background, particles, and ambient audio for each game mode
 * v0.26.14 - Dynamic Environment & Ambient System
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AmbientMode, getAmbientScene } from '@parel/core/config/ambientConfig';
import { useCombatPreferences } from '@parel/core/hooks/useCombatPreferences';

interface AmbientManagerProps {
  mode: AmbientMode;
  className?: string;
}

export function AmbientManager({ mode, className = '' }: AmbientManagerProps) {
  const { preferences } = useCombatPreferences();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousModeRef = useRef<AmbientMode | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const scene = getAmbientScene(mode);
  const gradient = `linear-gradient(135deg, ${scene.gradient.join(', ')})`;

  // Handle visibility (pause when tab inactive)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle ambient audio loop (v0.26.14)
  useEffect(() => {
    if (!preferences.ambientEnabled || !preferences.soundEnabled || !scene.sfx) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      previousModeRef.current = mode;
      return;
    }

    // Only start new audio if mode changed
    if (mode !== previousModeRef.current) {
      // Stop previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Start new audio loop
      try {
        const audio = new Audio(`/sfx/${scene.sfx}`);
        audio.loop = true;
        audio.volume = 0.15; // Low volume for ambient (15%)
        audio.play().catch(() => {
          // Silently fail if autoplay blocked
        });
        audioRef.current = audio;
        previousModeRef.current = mode;
      } catch (err) {
        // Silently fail
        previousModeRef.current = mode;
      }
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [mode, scene.sfx, preferences.ambientEnabled, preferences.soundEnabled]);

  // Pause/resume audio based on visibility
  useEffect(() => {
    if (audioRef.current) {
      if (isVisible && preferences.ambientEnabled && preferences.soundEnabled) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isVisible, preferences.ambientEnabled, preferences.soundEnabled]);

  // Render particles based on scene type
  const renderParticles = () => {
    if (!preferences.ambientEnabled) return null;

    switch (scene.particles) {
      case 'embers':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`ember-${i}`}
                className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-60"
                initial={{
                  x: `${10 + (i * 8)}%`,
                  y: '100%',
                  opacity: 0,
                }}
                animate={{
                  y: '-10%',
                  opacity: [0, 0.6, 0],
                  x: `${10 + (i * 8) + (Math.sin(i) * 3)}%`,
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>
        );

      case 'sparks':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`spark-${i}`}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                initial={{
                  x: `${20 + (i * 10)}%`,
                  y: `${60 + (i * 5)}%`,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  y: `${50 + (i * 5) - 20}%`,
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0],
                  x: `${20 + (i * 10) + (Math.cos(i) * 5)}%`,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        );

      case 'coins':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`coin-${i}`}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-50"
                initial={{
                  x: `-5%`,
                  y: `${20 + (i * 8)}%`,
                  opacity: 0,
                }}
                animate={{
                  x: '105%',
                  y: `${20 + (i * 8) - 10}%`,
                  opacity: [0, 0.5, 0.5, 0],
                }}
                transition={{
                  duration: 12 + Math.random() * 6,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.8,
                }}
              />
            ))}
          </div>
        );

      case 'glow':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`fixed inset-0 -z-10 ${className}`}
      initial={{ opacity: 0 }}
      animate={{
        background: gradient,
        opacity: 1,
      }}
      transition={{
        duration: 1.5,
        ease: 'easeInOut',
      }}
    >
      {/* Particle layer */}
      {renderParticles()}
    </motion.div>
  );
}


