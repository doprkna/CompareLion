"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logger } from '@/lib/logger';
import { 
  Gift, 
  Users, 
  Trophy, 
  Copy, 
  Check, 
  Loader2,
  Sparkles,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ReferralData {
  inviteCode: string;
  shareUrl: string;
  referralCount: number;
  totalXpEarned: number;
  referrals: Array<{
    id: string;
    referredUser: {
      name: string | null;
      email: string;
    };
    createdAt: string;
    rewardGranted: boolean;
  }>;
}

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchReferralData();
    }
  }, [status, router]);

  const fetchReferralData = async () => {
    try {
      const res = await fetch('/api/referrals');
      const data = await res.json();
      
      if (data.success) {
        setReferralData(data);
      }
    } catch (error) {
      logger.error('Error fetching referral data', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('Error copying to clipboard', error);
    }
  };

  const shareViaWeb = async () => {
    if (!referralData) return;

    const shareData = {
      title: 'Join PareL',
      text: 'Compare yourself, discover insights, and level up with me on PareL!',
      url: referralData.shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyToClipboard(referralData.shareUrl);
      }
    } catch (error) {
      logger.error('Error sharing', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-subtle">Failed to load referral data</p>
      </div>
    );
  }

  const nextMilestone = referralData.referralCount >= 10 ? 25 : 
                        referralData.referralCount >= 5 ? 10 : 5;
  const progressToNext = (referralData.referralCount / nextMilestone) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 bg-gradient-to-r from-accent to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Gift className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-text mb-2">Referral Rewards</h1>
        <p className="text-subtle">Invite friends and earn XP + exclusive badges</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-text">{referralData.referralCount}</div>
              <div className="text-sm text-subtle">Friends Referred</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-3xl font-bold text-text">{referralData.totalXpEarned}</div>
              <div className="text-sm text-subtle">XP Earned</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-text">{nextMilestone}</div>
              <div className="text-sm text-subtle">Next Milestone</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text">Progress to {nextMilestone} referrals</span>
              <span className="text-sm text-subtle">{referralData.referralCount}/{nextMilestone}</span>
            </div>
            <div className="w-full bg-border rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-accent to-blue-500"
              />
            </div>
          </div>
          <p className="text-sm text-subtle">
            {nextMilestone === 5 && "Unlock 'Community Builder' badge at 5 referrals!"}
            {nextMilestone === 10 && "Unlock 'Growth Champion' badge at 10 referrals!"}
            {nextMilestone === 25 && "Unlock 'Legendary Recruiter' badge at 25 referrals!"}
          </p>
        </CardContent>
      </Card>

      {/* Share Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralData.shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={() => copyToClipboard(referralData.shareUrl)}
                variant="outline"
                className="min-w-[100px]"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                value={referralData.inviteCode}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={() => copyToClipboard(referralData.inviteCode)}
                variant="outline"
              >
                Copy Code
              </Button>
            </div>

            <Button
              onClick={shareViaWeb}
              className="w-full bg-gradient-to-r from-accent to-blue-500"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share with Friends
            </Button>
          </div>

          <div className="mt-6 p-4 bg-bg border border-border rounded-lg">
            <h4 className="font-semibold text-text mb-2">Earn Rewards:</h4>
            <ul className="space-y-2 text-sm text-subtle">
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span><strong className="text-accent">100 XP</strong> for each friend who joins</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span><strong className="text-accent">50 XP</strong> bonus for your friend</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Exclusive badges at 5, 10, and 25 referrals</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {referralData.referrals.length === 0 ? (
            <div className="text-center py-8 text-subtle">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No referrals yet. Start sharing to earn rewards!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referralData.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 bg-bg border border-border rounded-lg"
                >
                  <div>
                    <div className="font-medium text-text">
                      {referral.referredUser.name || referral.referredUser.email}
                    </div>
                    <div className="text-sm text-subtle">
                      Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {referral.rewardGranted && (
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span className="text-accent font-medium">+100 XP</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

