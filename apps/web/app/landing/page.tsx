"use client";

import { useState, useEffect } from 'react';
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
  Check,
  Star,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState<any>(null);

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

  const handleJoinBeta = () => {
    if (email) {
      router.push(`/waitlist?email=${encodeURIComponent(email)}`);
    } else {
      router.push('/waitlist');
    }
  };

  const handleGetStarted = () => {
    router.push('/signup');
  };

  const handleContinueToDashboard = () => {
    router.push('/main');
  };

  const isLoggedIn = status === 'authenticated';
  const userName = session?.user?.name || userData?.name || 'there';

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg">
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
                    <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-card border border-border rounded-full">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-accent to-blue-500 flex items-center justify-center text-xs text-white font-bold">
                        {userData.level || 1}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                        <span className="text-text font-medium">{userData.xp || 0}</span>
                        {userData.streakCount > 0 && (
                          <>
                            <span className="text-border">|</span>
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            <span className="text-text font-medium">{userData.streakCount}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <Button 
                    onClick={handleContinueToDashboard}
                    className="bg-gradient-to-r from-accent to-blue-500 hover:shadow-lg hover:shadow-accent/30"
                  >
                    Continue to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
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
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-accent to-blue-500 hover:shadow-lg hover:shadow-accent/30"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {isLoggedIn ? (
                <>
                  <div className="mb-4 inline-block px-4 py-2 bg-accent/10 border border-accent/30 rounded-full">
                    <span className="text-accent font-semibold">Welcome back, {userName}! 👋</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold text-text mb-6 leading-tight">
                    Ready to{' '}
                    <span className="bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent">
                      Level Up?
                    </span>
                  </h1>
                  <p className="text-xl text-subtle mb-8 max-w-2xl">
                    Jump back into your journey. Answer more questions, climb the leaderboard, 
                    and discover new insights about yourself.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-5xl md:text-6xl font-bold text-text mb-6 leading-tight">
                    Compare Yourself.{' '}
                    <span className="bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent">
                      Level Up.
                    </span>
                  </h1>
                  <p className="text-xl text-subtle mb-8 max-w-2xl">
                    Answer questions, see how you compare with others, and discover insights 
                    about yourself through gamified polling and self-discovery.
                  </p>
                </>
              )}
              
              {/* CTA - Different for logged-in vs guest */}
              {isLoggedIn ? (
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button
                    onClick={handleContinueToDashboard}
                    size="lg"
                    className="bg-gradient-to-r from-accent to-blue-500 px-12 py-6 text-xl font-semibold hover:shadow-xl hover:shadow-accent/30"
                  >
                    Continue to Dashboard
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </div>
              ) : (
                <>
                  {/* Email capture */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-6 py-4 rounded-xl bg-card border-2 border-border text-text placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinBeta()}
                    />
                    <Button
                      onClick={handleJoinBeta}
                      size="lg"
                      className="bg-gradient-to-r from-accent to-blue-500 px-8 py-4 text-lg font-semibold hover:shadow-xl hover:shadow-accent/30"
                    >
                      Join Beta
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-subtle">
                    Free forever. No credit card required.
                  </p>
                </>
              )}
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
                <div className="space-y-4">
                  {/* Mock question */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-text mb-4">
                      How many hours do you sleep per night?
                    </h3>
                    <div className="space-y-2">
                      {['Less than 5', '5-6 hours', '7-8 hours', 'More than 8'].map((option, i) => (
                        <div
                          key={i}
                          className="bg-bg border border-border rounded-lg p-3 hover:border-accent transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-text">{option}</span>
                            {i === 2 && <Check className="h-4 w-4 text-accent" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Mock stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">78%</div>
                      <div className="text-xs text-subtle">Similar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">+150</div>
                      <div className="text-xs text-subtle">XP Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">Top 20%</div>
                      <div className="text-xs text-subtle">Rank</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-accent to-blue-500 px-12 py-6 text-xl font-semibold hover:shadow-2xl hover:shadow-accent/40"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-6 w-6" />
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
          
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-subtle">
            © {new Date().getFullYear()} PareL. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

