'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Zap, User, MessageCircle, Settings, LogOut, Bell } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Close drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    { href: '/main', label: 'Dashboard', icon: Home },
    { href: '/flow', label: 'Flow', icon: Zap },
    { href: '/friends', label: 'Messages', icon: MessageCircle },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (!session) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-b from-purple-900 to-indigo-900 z-50 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🦁</span>
                <div>
                  <h2 className="text-xl font-bold text-white">PareL</h2>
                  <p className="text-sm text-purple-200">
                    {session.user?.name || 'Explorer'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                          ${isActive 
                            ? 'bg-white/20 text-white shadow-lg' 
                            : 'text-purple-100 hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Divider */}
            <div className="mx-4 my-2 border-t border-white/10" />

            {/* Secondary Actions */}
            <div className="p-4 space-y-2">
              <Link
                href="/notifications"
                className="flex items-center gap-3 px-4 py-3 text-purple-100 hover:bg-white/10 hover:text-white rounded-lg transition-all"
              >
                <Bell size={20} />
                <span className="font-medium">Notifications</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-lg transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-auto p-6 text-center text-xs text-purple-300">
              <p>PareL v0.21.0</p>
              <p className="mt-1">Cross-Platform Edition</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

