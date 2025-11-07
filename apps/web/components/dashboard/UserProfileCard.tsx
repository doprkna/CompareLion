'use client';

/**
 * User Profile Card
 * v0.19.6 - Display user profiles with avatars, bios, and badges
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';

interface UserBadge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  rarity: string;
  earnedAt: string;
}

interface UserProfile {
  id: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  visibility: string;
  level: number;
  xp: number;
  karmaScore: number;
  archetype: string | null;
  joinedAt: string;
  equippedTitle: string | null;
  equippedIcon: string | null;
  equippedBackground: string | null;
  badges: UserBadge[];
  isPrivate: boolean;
}

interface UserProfileCardProps {
  userId: string;
}

export function UserProfileCard({ userId }: UserProfileCardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      logger.error('Failed to fetch profile', err);
      setError('Error loading profile');
    } finally{
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md animate-pulse">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className="w-full max-w-md border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400">{error || 'Profile not found'}</p>
        </CardContent>
      </Card>
    );
  }

  if (profile.isPrivate) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.username || profile.name || 'User'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {(profile.username || profile.name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-lg">
                {profile.username || profile.name || 'Anonymous User'}
              </CardTitle>
              <CardDescription>🔒 Private Profile</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This profile is private</p>
        </CardContent>
      </Card>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic':
        return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white';
      case 'rare':
        return 'bg-blue-500 text-white';
      case 'uncommon':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.username || profile.name || 'User'}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {(profile.username || profile.name || 'U')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {profile.equippedIcon && <span>{profile.equippedIcon}</span>}
              {profile.username || profile.name || 'Anonymous User'}
            </CardTitle>
            <CardDescription>
              {profile.equippedTitle && (
                <span className="text-xs font-medium text-primary">{profile.equippedTitle} • </span>
              )}
              Level {profile.level} {profile.archetype}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted p-2">
            <div className="text-xs text-muted-foreground">XP</div>
            <div className="font-semibold text-sm">⭐ {profile.xp.toLocaleString()}</div>
          </div>
          <div className="rounded-lg bg-muted p-2">
            <div className="text-xs text-muted-foreground">Level</div>
            <div className="font-semibold text-sm">🏆 {profile.level}</div>
          </div>
          <div className="rounded-lg bg-muted p-2">
            <div className="text-xs text-muted-foreground">Karma</div>
            <div className="font-semibold text-sm">✨ {profile.karmaScore}</div>
          </div>
        </div>

        {/* Social Actions (for non-private profiles) */}
        {!profile.isPrivate && profile.id !== userId && profile.visibility !== 'PRIVATE' && (
          <Button
            onClick={() => window.location.href = `/messages/${profile.id}`}
            className="w-full"
            variant="outline"
          >
            💬 Send Message
          </Button>
        )}

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Badges</h4>
            <div className="flex flex-wrap gap-2">
              {profile.badges.slice(0, 5).map((badge) => (
                <Badge
                  key={badge.id}
                  className={`${getRarityColor(badge.rarity)} text-xs px-2 py-1`}
                  title={badge.description}
                >
                  {badge.iconUrl && (
                    <img
                      src={badge.iconUrl}
                      alt={badge.name}
                      className="w-4 h-4 inline mr-1"
                    />
                  )}
                  {badge.name}
                </Badge>
              ))}
              {profile.badges.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.badges.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Joined Date */}
        <p className="text-xs text-muted-foreground">
          Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </CardContent>
    </Card>
  );
}

