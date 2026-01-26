'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FriendCard } from '@/components/social/FriendCard';
import { FeedItem } from '@/components/social/FeedItem';
import { useFriends, useSocialFeed, useFriendRequest, Friend } from '@parel/core/hooks/useSocial';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Loader2, RefreshCw, UserPlus } from 'lucide-react';

export default function SocialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'friends' | 'feed'>('friends');

  const { friends, loading, error, reload } = useFriends();
  const { feed, loading: feedLoading, reload: reloadFeed } = useSocialFeed();
  const { sendRequest, loading: requestLoading } = useFriendRequest();

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-subtle" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-2">
          <Users className="w-8 h-8" />
          Social Hub
        </h1>
        <p className="text-subtle">Connect with friends and see what's happening</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'friends' ? 'default' : 'outline'}
          onClick={() => setActiveTab('friends')}
        >
          Friends ({friends.length})
        </Button>
        <Button
          variant={activeTab === 'feed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('feed')}
        >
          Feed
        </Button>
        <Button
          variant="outline"
          onClick={() => activeTab === 'friends' ? reload() : reloadFeed()}
          disabled={activeTab === 'friends' ? loading : feedLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-card border-red-500/20 mb-6">
          <CardContent className="p-4">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div>
          {friends.length === 0 && !loading && (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-subtle" />
                <h3 className="text-xl font-semibold text-text mb-2">No Friends Yet</h3>
                <p className="text-subtle mb-4">Start connecting with other players!</p>
                <Button variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Find Friends
                </Button>
              </CardContent>
            </Card>
          )}

          {friends.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.friendshipId}
                  friend={friend}
                  onRemove={async () => {
                    try {
                      await sendRequest(friend.id, 'decline');
                      alert('🤝 Friend removed');
                      reload();
                    } catch (err) {
                      // Error handled by hook
                    }
                  }}
                  removing={requestLoading}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div>
          {feedLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-subtle" />
            </div>
          )}

          {!feedLoading && feed.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-subtle" />
                <h3 className="text-xl font-semibold text-text mb-2">No Activity Yet</h3>
                <p className="text-subtle">Activity from your friends will appear here.</p>
              </CardContent>
            </Card>
          )}

          {!feedLoading && feed.length > 0 && (
            <div className="space-y-3">
              {feed.map((item, idx) => (
                <FeedItem key={`${item.type}-${item.userId}-${idx}`} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}




