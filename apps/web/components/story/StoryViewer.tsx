/**
 * Story Viewer Component
 * Swipe/carousel mode story viewer
 * v0.40.11 - Story Viewer 2.0 (Swipe / Carousel Mode)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StoryPanel {
  imageUrl: string;
  caption: string;
  vibeTag: string;
  microStory: string;
  role?: string | null;
}

interface StoryViewerProps {
  panels: StoryPanel[];
  title?: string | null;
  autoplay?: boolean;
  onClose?: () => void;
}

const AUTOPLAY_INTERVAL = 5000; // 5 seconds per panel

export function StoryViewer({ panels, title, autoplay: initialAutoplay = false, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(initialAutoplay);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const currentPanel = panels[currentIndex];

  // Handle autoplay
  useEffect(() => {
    if (isAutoplay && panels.length > 1) {
      autoplayTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % panels.length);
      }, AUTOPLAY_INTERVAL);
    } else {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [isAutoplay, panels.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  function goToNext() {
    setCurrentIndex((prev) => (prev + 1) % panels.length);
  }

  function goToPrevious() {
    setCurrentIndex((prev) => (prev - 1 + panels.length) % panels.length);
  }

  function goToPanel(index: number) {
    setCurrentIndex(index);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    if (!touchStartXRef.current || !touchEndXRef.current) return;

    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe left - next panel
        goToNext();
      } else {
        // Swipe right - previous panel
        goToPrevious();
      }
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  }

  if (panels.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <p className="text-subtle">No panels available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-bg">
      {/* Title */}
      {title && (
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-text">{title}</h2>
        </div>
      )}

      {/* Main Viewer */}
      <div
        className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image */}
        <img
          src={currentPanel.imageUrl}
          alt={currentPanel.caption || `Panel ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation Buttons */}
        {panels.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={goToPrevious}
              aria-label="Previous panel"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={goToNext}
              aria-label="Next panel"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Panel Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {currentPanel.caption && (
            <p className="text-white font-semibold mb-1">{currentPanel.caption}</p>
          )}
          {currentPanel.vibeTag && (
            <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs rounded mb-2">
              {currentPanel.vibeTag}
            </span>
          )}
          {currentPanel.microStory && (
            <p className="text-white/90 text-sm mt-2">{currentPanel.microStory}</p>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      {panels.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {panels.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPanel(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-subtle w-2 hover:bg-primary/50'
              }`}
              aria-label={`Go to panel ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {panels.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoplay(!isAutoplay)}
            className="flex items-center gap-2"
          >
            {isAutoplay ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Autoplay
              </>
            )}
          </Button>
        )}
        <div className="text-sm text-subtle">
          {currentIndex + 1} / {panels.length}
        </div>
      </div>
    </div>
  );
}
