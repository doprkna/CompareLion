"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAppPreload } from '@/hooks/useAppPreload';
import { Sparkles, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { preloadApp, isPreloading, isReady } = useAppPreload();
  const [showLoading, setShowLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Short splash then redirect
      const timer = setTimeout(() => {
        router.push('/main');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [status, session, router]);

  const handleStart = async () => {
    setShowLoading(true);
    await preloadApp();
    
    if (isReady) {
      router.push('/main');
    }
  };

  // Show loading screen during preload
  if (showLoading) {
    return <LoadingScreen onComplete={() => router.push('/main')} />;
  }

  // Show simple splash while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-4xl font-bold text-text"
        >
          PareL
        </motion.div>
      </div>
    );
  }

  // Show redirect message for authenticated users
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-4xl font-bold text-text"
          >
            PareL
          </motion.div>
          <p className="text-subtle">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg">
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-accent to-blue-500 shadow-2xl shadow-accent/50 flex items-center justify-center mb-6">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-text text-center mb-3">PareL</h1>
          <p className="text-xl text-subtle text-center max-w-md">
            Level up through gamified insights and challenges
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center mb-8"
        >
          <div className="px-4 py-2 bg-card border border-border rounded-full text-sm text-text flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            Track Progress
          </div>
          <div className="px-4 py-2 bg-card border border-border rounded-full text-sm text-text flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            Compare with Others
          </div>
          <div className="px-4 py-2 bg-card border border-border rounded-full text-sm text-text flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Earn Rewards
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
        >
          <button
            onClick={handleStart}
            disabled={isPreloading}
            className="flex-1 bg-gradient-to-r from-accent to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPreloading ? 'Loading...' : 'Start'}
          </button>
          <button
            onClick={() => router.push('/login')}
            className="flex-1 bg-card text-text border-2 border-accent px-8 py-4 rounded-2xl font-bold text-lg hover:bg-accent/10 transition-all"
          >
            Login
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-subtle text-sm"
        >
          New to PareL?{' '}
          <button
            onClick={() => router.push('/signup')}
            className="text-accent hover:underline font-medium"
          >
            Create an account
          </button>
        </motion.p>
      </div>
    </div>
  );
}



