/**
 * RPG Button Component
 * Unified button styling for Profile, Inventory, and Shop screens
 * v0.26.11 - UI Cohesion & Inventory Sync
 */

'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RpgButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'disabled';
  children: ReactNode;
  className?: string;
}

export function RpgButton({
  variant = 'primary',
  children,
  className,
  disabled,
  ...props
}: RpgButtonProps) {
  const isDisabled = disabled || variant === 'disabled';

  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 min-h-[44px] px-4 py-2 touch-manipulation';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/20 active:scale-95',
    secondary: 'bg-gray-800/60 border border-gray-700 text-gray-200 hover:bg-gray-800/80 hover:border-gray-600 active:scale-95',
    disabled: 'bg-gray-700/40 border border-gray-700/50 text-gray-500 cursor-not-allowed',
  };

  const content = (
    <button
      className={cn(baseStyles, variants[variant], isDisabled && 'cursor-not-allowed opacity-60', className)}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );

  if (isDisabled) {
    return content;
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      {content}
    </motion.div>
  );
}

