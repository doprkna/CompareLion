/**
 * Following Page
 * Display users that the current user is following
 * v0.37.3 - Follow User Feature
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import useSWR from 'swr';
import { FollowButton } from '@/app/components/FollowButton';
import Link from 'next/link';

const fetcher = (url: string) => apiFetch(url).then((res: any) => res.ok ? res.data : null);

export default function FollowingPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/social/following', fetcher);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Card className="border-red-500">
          <CardContent className="p-6 text-center text-red-500">
            <p>Failed to load following list</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const following = data?.following || [];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <UserPlus className="w-8 h-8" />
          Following
        </h1>
        <p className="text-gray-400">
          {following.length} {following.length === 1 ? 'user' : 'users'}
        </p>
      </div>

      {following.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Not following anyone yet</h2>
            <p className="text-gray-400">
              Start following users to see their activity in your feed
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {following.map((user: any) => (
            <Card key={user.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link 
                      href={`/profile/${user.id}`}
                      className="hover:text-accent transition-colors"
                    >
                      <h3 className="font-semibold text-lg">
                        {user.name || user.username || 'Unknown User'}
                      </h3>
                    </Link>
                    <div className="text-sm text-gray-400 mt-1">
                      {user.username && user.username !== user.name && (
                        <span>@{user.username}</span>
                      )}
                      {user.archetype && (
                        <span className="ml-2">• {user.archetype}</span>
                      )}
                      <span className="ml-2">• Level {user.level}</span>
                    </div>
                  </div>
                  <FollowButton
                    targetUserId={user.id}
                    size="sm"
                    onFollowChange={() => mutate()}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

