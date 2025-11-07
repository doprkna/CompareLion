"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, Loader2, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import confetti from 'canvas-confetti';
import { logger } from '@/lib/logger';

function WaitlistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [refCode, setRefCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    // Pre-fill email from URL if present
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // Pre-fill referral code if present
    const refParam = searchParams.get('ref');
    if (refParam) {
      setRefCode(refParam);
    }

    // Fetch waitlist count
    fetchWaitlistCount();
  }, [searchParams]);

  const fetchWaitlistCount = async () => {
    try {
      const res = await fetch('/api/waitlist');
      const data = await res.json();
      if (data.success) {
        setWaitlistCount(data.count || 0);
      }
    } catch (err) {
      logger.error('Error fetching waitlist count', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          refCode: refCode || undefined,
          source: 'waitlist-page'
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Update count
        fetchWaitlistCount();
      } else {
        setError(data.error || 'Failed to join waitlist');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-text mb-4">
            You're In! 🎉
          </h2>
          
          <p className="text-subtle mb-6">
            Welcome to the PareL beta waitlist! We'll send you an invite soon.
          </p>

          <div className="bg-bg border border-border rounded-xl p-4 mb-6">
            <div className="text-sm text-subtle mb-1">Your position</div>
            <div className="text-2xl font-bold text-accent">
              #{waitlistCount}
            </div>
          </div>

          <p className="text-sm text-subtle mb-6">
            Want to move up? Share your referral link and earn early access!
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/signup')}
              className="w-full bg-gradient-to-r from-accent to-blue-500"
            >
              Continue to Sign Up
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/landing')}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-accent to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-text mb-4">
            Join the Beta
          </h1>
          
          <p className="text-lg text-subtle">
            Get early access to PareL and be part of our growing community
          </p>
        </div>

        {/* Stats */}
        <div className="bg-card border border-border rounded-xl p-4 mb-8 flex items-center justify-center gap-2">
          <Users className="h-5 w-5 text-accent" />
          <span className="text-text">
            <span className="font-bold text-accent">{waitlistCount}</span> people waiting
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="refCode" className="block text-sm font-medium text-text mb-2">
                Referral Code <span className="text-subtle text-xs">(optional)</span>
              </label>
              <Input
                id="refCode"
                type="text"
                placeholder="Enter code"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-500 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent to-blue-500 hover:shadow-lg hover:shadow-accent/30"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-subtle text-center">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-accent hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </form>

        <p className="text-center text-sm text-subtle mt-6">
          By joining, you agree to our{' '}
          <button onClick={() => router.push('/info/terms')} className="text-accent hover:underline">
            Terms
          </button>{' '}
          and{' '}
          <button onClick={() => router.push('/info/privacy')} className="text-accent hover:underline">
            Privacy Policy
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    }>
      <WaitlistContent />
    </Suspense>
  );
}

