'use client';

/**
 * Avatar Atom
 * v0.42.2 - C4 Step 3: Badge, Avatar, Divider, Spinner implementation
 * User profile image/initials display with fallback and status indicator
 */

import React, { useState } from 'react';
import { Icon } from '@parel/ui/atoms';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  fallback?: string; // Initials or text fallback
  status?: AvatarStatus;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { dimension: string; textSize: string }> = {
  sm: { dimension: 'w-6 h-6', textSize: 'text-xs' },
  md: { dimension: 'w-8 h-8', textSize: 'text-sm' },
  lg: { dimension: 'w-10 h-10', textSize: 'text-base' },
  xl: { dimension: 'w-12 h-12', textSize: 'text-lg' },
};

const statusStyles: Record<AvatarStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

const statusSizeStyles: Record<AvatarSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
  xl: 'w-3 h-3',
};

function getInitials(fallback?: string, alt?: string): string {
  if (fallback) {
    // Use fallback directly if provided
    return fallback.length <= 2 ? fallback.toUpperCase() : fallback.substring(0, 2).toUpperCase();
  }
  if (alt) {
    // Extract initials from alt text
    const words = alt.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return words[0].substring(0, 2).toUpperCase();
  }
  return '?';
}

export function Avatar({
  src,
  alt = '',
  size = 'md',
  fallback,
  status,
  className = '',
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = sizeStyles[size];
  const baseStyles = 'relative inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium overflow-hidden';
  const combinedStyles = `${baseStyles} ${sizeClass.dimension} ${sizeClass.textSize} ${className}`.trim();

  const showImage = src && !imageError;
  const initials = getInitials(fallback, alt);

  return (
    <div className={combinedStyles}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : fallback || initials !== '?' ? (
        <span>{initials}</span>
      ) : (
        <Icon name="user" size={size === 'sm' ? 'sm' : size === 'xl' ? 'lg' : 'md'} className="text-gray-400" aria-hidden="true" />
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${statusStyles[status]} ${statusSizeStyles[size]}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}
