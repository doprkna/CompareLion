/**
 * Story Challenges Page
 * Browse active and upcoming story challenges
 * v0.40.8 - Story Challenges 1.0 (Community Story Prompts)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Eye } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { apiFetch } from '@/lib/apiBase';

interface StoryChallenge {
  id: string;
  title: string;
  description: string;
  promptType: 'image' | 'story' | 'extended';
  startAt: string;
  endAt: string;
  isActive: boolean;
  createdAt: string;
}

interface ChallengesResponse {
  success: boolean;
  challenges: {
    active: StoryChallenge[];
    upcoming: StoryChallenge[];
  };
  error?: string;
}

export default function StoryChallengesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [challenges, setChallenges] = useState<{
    active: StoryChallenge[];
    upcoming: StoryChallenge[];
  }>({ active: [], upcoming: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadChallenges();
    }
  }, [status, router]);

  async function loadChallenges() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/story/challenges');
      const data = (await res.json()) as ChallengesResponse;

      if (data.success) {
        setChallenges(data.challenges);
      }
    } catch (error) {
      console.error('Failed to load challenges', error);
    } finally {
      setLoading(false);
    }
  }

  function handleViewEntries(challengeId: string) {
    router.push(`/story/challenges/${challengeId}`);
  }

  function handleSubmitStory(challengeId: string) {
    router.push(`/story/challenges/${challengeId}?submit=true`);
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-subtle" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text mb-2">Story Challenges</h1>
          <p className="text-subtle">Themed prompts for community creativity</p>
        </div>

        {/* Active Challenges */}
        {challenges.active.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-4">Active Challenges</h2>
            <div className="space-y-4">
              {challenges.active.map((challenge) => (
                <Card key={challenge.id} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{challenge.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {challenge.promptType}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text mb-4">{challenge.description}</p>
                    <div className="flex items-center gap-4 text-sm text-subtle mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(challenge.startAt), 'MMM d')} -{' '}
                          {format(new Date(challenge.endAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <span>
                        Ends {formatDistanceToNow(new Date(challenge.endAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEntries(challenge.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Entries
                      </Button>
                      {session && (
                        <Button
                          size="sm"
                          onClick={() => handleSubmitStory(challenge.id)}
                        >
                          Submit Story
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Challenges */}
        {challenges.upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-4">Upcoming Challenges</h2>
            <div className="space-y-4">
              {challenges.upcoming.map((challenge) => (
                <Card key={challenge.id} className="bg-card border-border opacity-75">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{challenge.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {challenge.promptType}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text mb-4">{challenge.description}</p>
                    <div className="flex items-center gap-4 text-sm text-subtle">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Starts {format(new Date(challenge.startAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <span>
                        {formatDistanceToNow(new Date(challenge.startAt), { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {challenges.active.length === 0 && challenges.upcoming.length === 0 && !loading && (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-subtle">No challenges available at the moment. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

