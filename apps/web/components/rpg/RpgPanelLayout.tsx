/**
 * RPG Panel Layout
 * Unified layout wrapper for Profile, Inventory, and Shop screens
 * v0.26.11 - UI Cohesion & Inventory Sync
 */

'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface RpgPanelLayoutProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function RpgPanelLayout({ title, icon, children, className = '' }: RpgPanelLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rpg-panel bg-gray-900/60 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-700 ${className}`}
    >
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

