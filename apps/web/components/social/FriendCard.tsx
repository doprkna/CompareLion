'use client';

import { Friend } from '@parel/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserMinus, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FriendCardProps {
  friend: Friend;
  onRemove?: () => void;
  removing?: boolean;
}

export function FriendCard({ friend, onRemove, removing }: FriendCardProps) {
  const displayName = friend.username || friend.name || 'Unknown';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <Card className="bg-card border-border hover:border-accent/50 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={friend.avatar || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{displayName}</CardTitle>
            <p className="text-xs text-subtle">
              Level {friend.level} • {friend.archetype || 'Adventurer'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {onRemove && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            disabled={removing}
            className="w-full"
          >
            <UserMinus className="w-4 h-4 mr-2" />
            {removing ? 'Removing...' : 'Remove Friend'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

