'use client';

/**
 * Beta Info Modal
 * Shows beta information and instructions to users
 * v0.13.2k - Beta Launch
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BetaInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BetaInfoModal({ isOpen, onClose }: BetaInfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-lg shadow-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🚀</span>
                    <div>
                      <h2 className="text-2xl font-bold">Welcome to PareL Beta!</h2>
                      <p className="text-sm opacity-90">v0.13.2k</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Overview */}
                <section>
                  <h3 className="text-xl font-semibold text-text mb-3 flex items-center gap-2">
                    <span>🎯</span> What is PareL?
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    PareL is an innovative question-flow platform that helps you explore topics,
                    learn new things, and track your progress. Answer questions, earn XP, level up,
                    and unlock new features as you grow.
                  </p>
                </section>

                {/* Beta Features */}
                <section>
                  <h3 className="text-xl font-semibold text-text mb-3 flex items-center gap-2">
                    <span>✨</span> Beta Features
                  </h3>
                  <ul className="space-y-2 text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Question Flows:</strong> Curated question sequences across multiple topics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>XP & Leveling:</strong> Earn experience points and unlock features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Profile System:</strong> Track your progress and achievements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Theme Support:</strong> Light and dark modes for comfortable viewing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Ambient Music:</strong> Optional background music while you explore</span>
                    </li>
                  </ul>
                </section>

                {/* How to Help */}
                <section>
                  <h3 className="text-xl font-semibold text-text mb-3 flex items-center gap-2">
                    <span>🤝</span> How You Can Help
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-bg rounded-lg p-4 border border-border">
                      <h4 className="font-semibold text-text mb-1">🐛 Report Bugs</h4>
                      <p className="text-sm text-text-secondary">
                        Found something broken? Let us know! Use the feedback form to report issues.
                      </p>
                    </div>
                    <div className="bg-bg rounded-lg p-4 border border-border">
                      <h4 className="font-semibold text-text mb-1">💡 Share Ideas</h4>
                      <p className="text-sm text-text-secondary">
                        Have suggestions for improvement? We'd love to hear them!
                      </p>
                    </div>
                    <div className="bg-bg rounded-lg p-4 border border-border">
                      <h4 className="font-semibold text-text mb-1">🎉 Share Praise</h4>
                      <p className="text-sm text-text-secondary">
                        Like something? Tell us what's working well so we can do more of it.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Known Issues */}
                <section>
                  <h3 className="text-xl font-semibold text-text mb-3 flex items-center gap-2">
                    <span>⚠️</span> Known Issues
                  </h3>
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">⚠</span>
                      <span>Some animations may be choppy on slower devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">⚠</span>
                      <span>Music toggle state may not persist between sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">⚠</span>
                      <span>Some question flows are still being populated</span>
                    </li>
                  </ul>
                </section>

                {/* Call to Action */}
                <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <p className="text-text mb-4">
                      <strong>Ready to share your thoughts?</strong>
                    </p>
                    <a
                      href="/feedback"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Send Feedback
                    </a>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 rounded-b-lg">
                <p className="text-xs text-text-secondary text-center">
                  Thank you for being an early tester! Your feedback shapes the future of PareL. 🙏
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useBetaInfoModal() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
}

