'use client';

/**
 * Invite Page
 * Share referral code and track invites
 * v0.13.2n - Community Growth
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiBase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Copy, Share2, Mail, MessageCircle, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface InviteData {
  inviteCode: string;
  shareUrl: string;
  referralCount: number;
}

export default function InvitePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    loadInviteData();
  }, [session, status, router]);

  async function loadInviteData() {
    setLoading(true);

    const res = await apiFetch('/api/invite');
    if ((res as any).ok) {
      const data = (res as any).data;
      
      // Load referral count from localStorage
      const savedCount = localStorage.getItem('referral_count');
      const count = savedCount ? parseInt(savedCount) : 0;
      
      setInviteData(data);
      setReferralCount(count);
    }

    setLoading(false);
  }

  async function copyToClipboard() {
    if (!inviteData) return;

    const shareText = `Join me on PareL! 🎮\n\nAnswer questions, compare yourself with others, and level up!\n\nUse my invite code: ${inviteData.inviteCode}\n\n${inviteData.shareUrl}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      
      toast({
        title: 'Copied!',
        description: 'Invite link copied to clipboard',
      });

      // Track event
      trackShare('copy');

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  }

  async function shareNative() {
    if (!inviteData) return;

    const shareData = {
      title: 'Join PareL',
      text: `Join me on PareL! Use code ${inviteData.inviteCode}`,
      url: inviteData.shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackShare('native');
      } catch (err) {
        // User cancelled
      }
    } else {
      copyToClipboard();
    }
  }

  function shareEmail() {
    if (!inviteData) return;

    const subject = encodeURIComponent('Join me on PareL!');
    const body = encodeURIComponent(
      `Hey!\n\nI've been using PareL to answer questions and compare myself with others. It's fun!\n\nJoin using my invite code: ${inviteData.inviteCode}\n\n${inviteData.shareUrl}\n\nSee you there!`
    );

    window.open(`mailto:?subject=${subject}&body=${body}`);
    trackShare('email');
  }

  function shareTwitter() {
    if (!inviteData) return;

    const text = encodeURIComponent(
      `🎮 Join me on @PareL_App!\n\nAnswer questions, level up, and compare yourself with others.\n\nUse code: ${inviteData.inviteCode}`
    );
    const url = encodeURIComponent(inviteData.shareUrl);

    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    trackShare('twitter');
  }

  function shareFacebook() {
    if (!inviteData) return;

    const url = encodeURIComponent(inviteData.shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    trackShare('facebook');
  }

  function shareWhatsApp() {
    if (!inviteData) return;

    const text = encodeURIComponent(
      `Join me on PareL! 🎮\n\nUse code: ${inviteData.inviteCode}\n${inviteData.shareUrl}`
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
    trackShare('whatsapp');
  }

  function trackShare(method: string) {
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [{
          name: 'invite_generated',
          timestamp: Date.now(),
          data: { method },
        }],
      }),
    });
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text text-xl">Loading...</div>
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text text-xl">Failed to load invite data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-text mb-2 flex items-center justify-center gap-3">
            <Users className="h-10 w-10 text-accent" />
            Invite Friends
          </h1>
          <p className="text-subtle">
            Share PareL with friends and earn rewards!
          </p>
        </div>

        {/* Invite Code Card */}
        <Card className="mb-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="text-center">Your Invite Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={inviteData.inviteCode}
                readOnly
                className="text-center text-2xl font-bold tracking-wider"
              />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-subtle mb-2">Share Link:</p>
              <code className="text-xs bg-bg/50 p-2 rounded block overflow-x-auto">
                {inviteData.shareUrl}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-accent">{referralCount}</div>
                <div className="text-sm text-subtle">Friends Invited</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-yellow-500">
                  {referralCount * 150} XP
                </div>
                <div className="text-sm text-subtle">Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Share Via</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={shareNative} className="w-full gap-2" size="lg">
              <Share2 className="h-5 w-5" />
              Share
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>

              <Button onClick={shareEmail} variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Button>

              <Button onClick={shareTwitter} variant="outline" className="gap-2">
                <span className="text-lg">𝕏</span>
                Twitter
              </Button>

              <Button onClick={shareFacebook} variant="outline" className="gap-2">
                <span className="text-lg">f</span>
                Facebook
              </Button>

              <Button onClick={shareWhatsApp} variant="outline" className="gap-2 col-span-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Info */}
        <Card className="mt-6 bg-accent/5 border-accent/20">
          <CardContent className="p-4">
            <h3 className="font-bold mb-2">🎁 Referral Rewards</h3>
            <ul className="text-sm text-subtle space-y-1">
              <li>• You get <strong>150 XP + 100 💎</strong> when a friend joins</li>
              <li>• Your friend gets <strong>50 XP + 25 💎</strong> as welcome bonus</li>
              <li>• Invite 10 friends to unlock exclusive badge!</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

