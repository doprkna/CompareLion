'use client';

import { Construction, Clock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface MaintenanceModeProps {
  message?: string;
  estimatedTime?: string;
}

export function MaintenanceMode({
  message = "We're currently performing scheduled maintenance to improve your experience.",
  estimatedTime,
}: MaintenanceModeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Icon */}
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 2,
          }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Construction className="w-12 h-12 text-yellow-400" />
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Under Maintenance
        </h1>

        {/* Message */}
        <p className="text-xl text-purple-200 mb-8">
          {message}
        </p>

        {/* Estimated Time */}
        {estimatedTime && (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full mb-8">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">
              Estimated time: {estimatedTime}
            </span>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-4xl mb-3">🦁</div>
            <h3 className="font-bold text-white mb-2">We'll Be Right Back</h3>
            <p className="text-sm text-purple-200">
              Our team is working hard to bring you an even better experience
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-bold text-white mb-2">What's New?</h3>
            <p className="text-sm text-purple-200">
              Performance improvements, bug fixes, and exciting new features
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-purple-300" />
            <h3 className="font-semibold text-white">Need Help?</h3>
          </div>
          <p className="text-sm text-purple-200">
            If you have urgent concerns, please contact us at{' '}
            <a
              href="mailto:support@parel.app"
              className="text-purple-300 hover:text-white underline transition-colors"
            >
              support@parel.app
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-purple-300">
          <p>Thank you for your patience! 🙏</p>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Check if maintenance mode is enabled
 */
export function isMaintenanceMode(): boolean {
  return process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
}

/**
 * Get maintenance message from env
 */
export function getMaintenanceConfig() {
  return {
    enabled: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
    message: process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE,
    estimatedTime: process.env.NEXT_PUBLIC_MAINTENANCE_ETA,
  };
}

