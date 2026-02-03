/**
 * Avatar Atom
 * v0.42.2 - C4 Step 3: Badge, Avatar, Divider, Spinner implementation
 * User profile image/initials display with fallback and status indicator
 */
import React from 'react';
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';
export interface AvatarProps {
    src?: string;
    alt?: string;
    size?: AvatarSize;
    fallback?: string;
    status?: AvatarStatus;
    className?: string;
}
export declare function Avatar({ src, alt, size, fallback, status, className, }: AvatarProps): React.JSX.Element;
