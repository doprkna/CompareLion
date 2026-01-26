/**
 * RewardToast Component
 * v0.26.9 - Expanded with Framer Motion animations and unified theme system
 */

"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RewardToast } from '@parel/core/hooks/useRewardToast';
import { TOAST_THEME, getToastStyles } from '@parel/core/config/toastTheme';

interface RewardToastProps {
  toast: RewardToast;
  index: number;
  onDismiss: (id: string) => void;
}

export function RewardToastComponent({ toast, index, onDismiss }: RewardToastProps) {
  const [isDismissing, setIsDismissing] = useState(false);
  const theme = TOAST_THEME[toast.type];
  const duration = theme.duration || 5000;

  // Start fade-out 500ms before removal (unless persistent)
  useEffect(() => {
    if (toast.persist) return;

    const fadeStart = duration - 500;
    const timer = setTimeout(() => {
      setIsDismissing(true);
    }, Math.max(0, fadeStart));
    
    return () => clearTimeout(timer);
  }, [duration, toast.persist]);

  // Animation variants based on theme
  const getAnimationVariant = () => {
    const animation = theme.animation || 'fade';
    
    switch (animation) {
      case 'shake':
        return {
          initial: { x: 100, opacity: 0 },
          animate: { 
            x: 0, 
            opacity: 1,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 25,
            },
          },
          exit: { 
            x: 100, 
            opacity: 0,
            transition: { duration: 0.3 },
          },
        };
      
      case 'bounce':
        return {
          initial: { y: 100, opacity: 0, scale: 0.8 },
          animate: { 
            y: 0, 
            opacity: 1,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 400,
              damping: 20,
            },
          },
          exit: { 
            y: 100, 
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.3 },
          },
        };
      
      case 'slide':
        return {
          initial: { x: 400, opacity: 0 },
          animate: { 
            x: 0, 
            opacity: 1,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 30,
            },
          },
          exit: { 
            x: 400, 
            opacity: 0,
            transition: { duration: 0.4 },
          },
        };
      
      default: // fade
        return {
          initial: { opacity: 0, y: 20 },
          animate: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4 },
          },
          exit: { 
            opacity: 0, 
            y: -20,
            transition: { duration: 0.3 },
          },
        };
    }
  };

  const animationVariant = getAnimationVariant();
  const styles = getToastStyles(toast.type);
  const offsetY = index * 60; // 60px spacing between toasts (v0.26.9)

  // Multi-line message support
  const messageLines = toast.message.split('\n');

  return (
    <motion.div
      initial={animationVariant.initial}
      animate={isDismissing ? animationVariant.exit : animationVariant.animate}
      exit={animationVariant.exit}
      className={`
        fixed bottom-4 right-4 z-50
        rounded-2xl p-3 pr-4 min-w-[200px] max-w-[400px]
        backdrop-blur-md border
        shadow-lg
        cursor-pointer hover:opacity-90
        ${styles}
        ${isDismissing ? 'opacity-0' : 'opacity-100'}
      `}
      style={{
        transform: `translateY(-${offsetY}px)`,
      }}
      onClick={() => onDismiss(toast.id)}
      role="alert"
      layout
    >
      <div className="flex items-start gap-2 text-sm font-medium text-white">
        <span className="text-lg leading-none mt-0.5 flex-shrink-0">
          {toast.icon || theme.icon}
        </span>
        <div className="flex-1 min-w-0">
          {messageLines.length > 1 ? (
            // Multi-line message support (v0.26.9)
            messageLines.map((line, i) => (
              <div key={i} className={i > 0 ? 'mt-1' : ''}>
                {line}
              </div>
            ))
          ) : (
            <span className="break-words">{toast.message}</span>
          )}
        </div>
        {!toast.persist && (
          <button
            className="text-white/50 hover:text-white ml-2 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface RewardToastContainerProps {
  toasts: RewardToast[];
  onDismiss: (id: string) => void;
}

export function RewardToastContainer({ toasts, onDismiss }: RewardToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <AnimatePresence mode="popLayout">
      {toasts.map((toast, index) => (
        <RewardToastComponent
          key={toast.id}
          toast={toast}
          index={index}
          onDismiss={onDismiss}
        />
      ))}
    </AnimatePresence>
  );
}
