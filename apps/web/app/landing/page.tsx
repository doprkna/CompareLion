"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Trophy, 
  Zap, 
  Target,
  ArrowRight,
  Star,
  Flame,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingPromoCard } from '@/components/landing/LandingPromoCard';
import {
  getPromoForSlot,
  getPromosForSlot,
  isFlowDemoHref,
} from '@/lib/landing/landingPromos';
import { cn } from '@/lib/utils';
import { GuestBlockedModal } from '@/components/auth/GuestBlockedModal';

/** Fastest path to a first question without auth (demo flow). */
const LANDING_PRIMARY_FLOW_HREF = '/flow-demo';
const LANDING_PRIMARY_CTA_LABEL = "Find out if you're normal";
const LANDING_FLOW_CTA_LOADING_LABEL = 'Loading your first question...';

const EXAMPLE_QUESTIONS = [
  'How often do people really argue with their partner?',
  'Are you more disciplined than others your age?',
  'Do people actually enjoy their job?',
  'Is your screen time normal or a cry for help?',
] as const;

function ExampleQuestionCards({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-left list-none p-0 m-0',
        className
      )}
    >
      {EXAMPLE_QUESTIONS.map((q, i) => (
        <li
          key={q}
          className={cn(
            'flex gap-3 items-start rounded-xl border-2 border-border bg-card/90 px-3.5 py-3 shadow-sm',
            'ring-1 ring-border/50',
            i === 1 && 'sm:border-dashed sm:border-accent/40 sm:bg-card'
          )}
        >
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-bg text-[10px] font-mono font-bold text-subtle border border-border"
            aria-hidden
          >
            Q
          </span>
          <span className="text-sm sm:text-[15px] leading-snug text-text font-medium">{q}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [flowNavigateBusyId, setFlowNavigateBusyId] = useState<string | null>(null);

  // Fetch user data when authenticated (v0.35.9 - removed auto-redirect to /main)
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Note: skipLandingAfterLogin preference removed - users can now access landing page freely
      // They can still navigate to /main via "Continue to Dashboard" button or nav menu
      
      // Fetch user data for stats display
      fetchUserData();
    }
  }, [status, session, router]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.status === 401) {
        console.warn('Session expired on landing page'); // sanity-fix
        // Don't redirect - landing page can be accessed without auth
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (error) {
      logger.error('Error fetching user data', error);
    }
  };



  const beginFlowNavigation = (href: string, sourceId: string) => {
    if (flowNavigateBusyId != null) return;
    setFlowNavigateBusyId(sourceId);
    router.push(href);
  };

  const flowNavLocked = flowNavigateBusyId != null;

  const handleContinueToDashboard = () => {
    router.push('/main');
  };

  const flowNavPrimaryContent = (busyId: string, iconSize: 'sm' | 'lg' | 'xl') => {
    const isBusy = flowNavigateBusyId === busyId;
    const spin =
      iconSize === 'sm' ? 'h-4 w-4' : iconSize === 'lg' ? 'h-5 w-5' : 'h-6 w-6';
    const arrow =
      iconSize === 'sm'
        ? 'h-4 w-4 ml-2'
        : iconSize === 'lg'
          ? 'h-5 w-5 ml-2'
          : 'h-6 w-6 ml-2';
    if (isBusy) {
      return (
        <>
          <Loader2 className={cn(spin, 'mr-2 shrink-0 animate-spin')} aria-hidden />
          {LANDING_FLOW_CTA_LOADING_LABEL}
        </>
      );
    }
    return (
      <>
        {LANDING_PRIMARY_CTA_LABEL}
        <ArrowRight className={cn(arrow, 'shrink-0')} aria-hidden />
      </>
    );
  };

  const isLoggedIn = status === 'authenticated';
  const userName = session?.user?.name || userData?.name || 'there';
  const heroSlotPromo = getPromoForSlot('hero-right');
  const belowHeroPromos = getPromosForSlot('below-hero', 3);
  const footerPromos = getPromosForSlot('footer', 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg">
      <Suspense fallback={null}>
        <GuestBlockedModal />
      </Suspense>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent to-blue-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-text">PareL</span>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  {/* User Chip */}
                  {userData && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-accent to-blue-500 flex items-center justify-center text-xs text-white font-bold">
                        {userData.level || 1}
                      </div>
                      {userData.streakCount > 0 ? (
                        <>
                          <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden />
                          <span className="text-sm text-text font-medium">
                            {userData.streakCount} day streak
                          </span>
                        </>
                      ) : null}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    onClick={handleContinueToDashboard}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    type="button"
                    onClick={() =>
                      beginFlowNavigation(LANDING_PRIMARY_FLOW_HREF, 'nav')
                    }
                    disabled={flowNavLocked}
                    aria-busy={flowNavigateBusyId === 'nav'}
                    className="inline-flex items-center bg-gradient-to-r from-accent to-blue-500 hover:shadow-lg hover:shadow-accent/30"
                  >
                    {flowNavPrimaryContent('nav', 'sm')}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/login')}
                  >
                    Login
                  </Button>
                  <Button 
                    type="button"
                    onClick={() =>
                      beginFlowNavigation(LANDING_PRIMARY_FLOW_HREF, 'nav')
                    }
                    disabled={flowNavLocked}
                    aria-busy={flowNavigateBusyId === 'nav'}
                    className="inline-flex items-center bg-gradient-to-r from-accent to-blue-500 hover:shadow-lg hover:shadow-accent/30"
                  >
                    {flowNavPrimaryContent('nav', 'sm')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero — above-the-fold: comparison hook, sample questions, CTA */}
      <section className="pt-24 pb-14 sm:pt-28 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-border/60 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/15 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:grid lg:grid-cols-5 gap-8 lg:gap-10 items-stretch lg:items-start text-center sm:text-left w-full"
          >
            <div className="lg:col-span-3 flex flex-col items-stretch min-w-0">
            {isLoggedIn ? (
              <>
                <p className="mb-3 text-sm font-medium text-accent">
                  Welcome back, {userName}
                </p>
                <h1 className="text-text text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4">
                  Compare your life with strangers.
                  <span className="block mt-1 text-3xl sm:text-4xl md:text-5xl font-bold text-subtle italic">
                    For science. Mostly.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-subtle max-w-2xl mb-6 leading-relaxed">
                  Answer a few weirdly honest questions and see how normal, cursed, or suspiciously average you are.
                </p>
                <ExampleQuestionCards className="mb-8 max-w-none" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Button
                    type="button"
                    onClick={() =>
                      beginFlowNavigation(LANDING_PRIMARY_FLOW_HREF, 'hero')
                    }
                    disabled={flowNavLocked}
                    aria-busy={flowNavigateBusyId === 'hero'}
                    size="lg"
                    className="inline-flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-accent to-blue-600 text-white font-semibold text-lg px-10 py-6 shadow-lg hover:shadow-accent/30 border border-white/10 min-h-[60px]"
                  >
                    {flowNavPrimaryContent('hero', 'lg')}
                  </Button>
                  <button
                    type="button"
                    onClick={handleContinueToDashboard}
                    className="text-sm font-medium text-subtle underline-offset-4 hover:underline hover:text-text"
                  >
                    Open dashboard
                  </button>
                </div>
                <p className="mt-4 text-sm text-subtle/90 max-w-xl">
                  No productivity cult. No fake wisdom. Just honest comparisons.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-text text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4">
                  Compare your life with strangers.
                  <span className="block mt-1 text-3xl sm:text-4xl md:text-5xl font-bold text-subtle italic">
                    For science. Mostly.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-subtle max-w-2xl mx-auto sm:mx-0 mb-6 leading-relaxed">
                  Answer a few weirdly honest questions and see how normal, cursed, or suspiciously average you are.
                </p>
                <ExampleQuestionCards className="mb-8 max-w-none" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Button
                    type="button"
                    onClick={() =>
                      beginFlowNavigation(LANDING_PRIMARY_FLOW_HREF, 'hero')
                    }
                    disabled={flowNavLocked}
                    aria-busy={flowNavigateBusyId === 'hero'}
                    size="lg"
                    className="inline-flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-accent to-blue-600 text-white font-semibold text-lg px-10 py-6 shadow-lg hover:shadow-accent/30 border border-white/10 min-h-[60px]"
                  >
                    {flowNavPrimaryContent('hero', 'lg')}
                  </Button>
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-sm font-medium text-subtle underline-offset-4 hover:underline hover:text-text"
                  >
                    Already have an account? Log in
                  </button>
                </div>
                <p className="mt-4 text-sm text-subtle/90 max-w-xl mx-auto sm:mx-0">
                  No productivity cult. No fake wisdom. Just honest comparisons.
                </p>
              </>
            )}
            </div>
            <div className="lg:col-span-2 w-full max-w-md mx-auto lg:max-w-none lg:mx-0 shrink-0">
              <LandingPromoCard
                promo={heroSlotPromo}
                onFlowDemoNavigate={
                  isFlowDemoHref(heroSlotPromo.ctaHref)
                    ? () =>
                        beginFlowNavigation(
                          heroSlotPromo.ctaHref!.trim(),
                          `promo-${heroSlotPromo.id}`
                        )
                    : undefined
                }
                flowNavigateBusyId={flowNavigateBusyId}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {belowHeroPromos.length > 0 ? (
        <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-border/60 bg-bg/80">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {belowHeroPromos.map((p) => (
                <LandingPromoCard
                  key={p.id}
                  promo={p}
                  onFlowDemoNavigate={
                    isFlowDemoHref(p.ctaHref)
                      ? () =>
                          beginFlowNavigation(
                            p.ctaHref!.trim(),
                            `promo-${p.id}`
                          )
                      : undefined
                  }
                  flowNavigateBusyId={flowNavigateBusyId}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-text mb-4">
              Why PareL?
            </h2>
            <p className="text-xl text-subtle max-w-2xl mx-auto">
              Turn everyday comparisons into meaningful insights and level up as you learn about yourself
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Compare & Discover',
                description: 'See how your answers stack up against others. From silly to serious, every comparison gives you perspective.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: TrendingUp,
                title: 'Level Up',
                description: 'Earn XP, unlock achievements, and climb the leaderboard as you answer questions and engage with the community.',
                color: 'from-accent to-pink-500'
              },
              {
                icon: Target,
                title: 'Track Progress',
                description: 'See your growth over time. Track streaks, complete challenges, and watch your profile evolve.',
                color: 'from-yellow-500 to-orange-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-xl hover:shadow-accent/10 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-subtle">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-text mb-4">
              Simple, Fun, Addictive
            </h2>
            <p className="text-xl text-subtle">
              Three steps to self-discovery
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Answer', description: 'Pick questions that interest you and share your perspective', icon: Zap },
              { step: '2', title: 'Compare', description: 'See how others answered and where you stand', icon: Users },
              { step: '3', title: 'Reward', description: 'Earn XP, unlock badges, and climb the ranks', icon: Trophy }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-accent to-blue-500 flex items-center justify-center text-2xl font-bold text-white">
                    {item.step}
                  </div>
                  <item.icon className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-2 h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">{item.title}</h3>
                <p className="text-subtle">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-text mb-4">
              Early Beta Users Love It
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I never knew how my sleep habits compared to others. This gave me perspective and motivation to improve!",
                author: "Sarah K.",
                role: "Beta User"
              },
              {
                quote: "It's like TikTok polls meets RPG progression. I'm hooked on answering questions and seeing my XP grow.",
                author: "Mike T.",
                role: "Early Adopter"
              },
              {
                quote: "Finally, a platform that makes self-discovery fun and social. The comparisons are eye-opening!",
                author: "Emma L.",
                role: "Community Member"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-text mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-text">{testimonial.author}</div>
                  <div className="text-sm text-subtle">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-accent/20 to-blue-500/20 border border-accent/30 rounded-2xl p-12 text-center"
          >
            <Sparkles className="h-12 w-12 mx-auto mb-6 text-accent" />
            <h2 className="text-4xl font-bold text-text mb-4">
              Ready to Compare Yourself?
            </h2>
            <p className="text-xl text-subtle mb-8">
              Join thousands discovering insights through comparison
            </p>
            <Button
              type="button"
              onClick={() =>
                beginFlowNavigation(LANDING_PRIMARY_FLOW_HREF, 'final')
              }
              disabled={flowNavLocked}
              aria-busy={flowNavigateBusyId === 'final'}
              size="lg"
              className="inline-flex items-center justify-center bg-gradient-to-r from-accent to-blue-500 px-12 py-6 text-xl font-semibold hover:shadow-2xl hover:shadow-accent/40 min-h-[72px]"
            >
              {flowNavPrimaryContent('final', 'xl')}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent to-blue-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-text">PareL</span>
              </div>
              <p className="text-subtle text-sm">
                Compare, discover, and level up through gamified self-discovery.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-text mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-subtle">
                <li><button onClick={() => router.push('/landing')} className="hover:text-accent">Features</button></li>
                <li><button onClick={() => router.push('/press')} className="hover:text-accent">Press Kit</button></li>
                <li><button onClick={() => router.push('/roadmap')} className="hover:text-accent">Roadmap</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-text mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-subtle">
                <li><button onClick={() => router.push('/leaderboard')} className="hover:text-accent">Leaderboard</button></li>
                <li><button onClick={() => router.push('/challenges')} className="hover:text-accent">Challenges</button></li>
                <li><button onClick={() => router.push('/feedback')} className="hover:text-accent">Feedback</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-text mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-subtle">
                <li><button onClick={() => router.push('/info/privacy')} className="hover:text-accent">Privacy</button></li>
                <li><button onClick={() => router.push('/info/terms')} className="hover:text-accent">Terms</button></li>
                <li><button onClick={() => router.push('/info/contact')} className="hover:text-accent">Contact</button></li>
              </ul>
            </div>
          </div>

          {footerPromos.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {footerPromos.map((p) => (
                <LandingPromoCard
                  key={p.id}
                  promo={p}
                  size="compact"
                  onFlowDemoNavigate={
                    isFlowDemoHref(p.ctaHref)
                      ? () =>
                          beginFlowNavigation(
                            p.ctaHref!.trim(),
                            `promo-${p.id}`
                          )
                      : undefined
                  }
                  flowNavigateBusyId={flowNavigateBusyId}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-subtle">
            © {new Date().getFullYear()} PareL. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

