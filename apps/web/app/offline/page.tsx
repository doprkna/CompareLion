import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Offline',
  description: 'You are currently offline',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="text-center px-4">
        <div className="mb-8">
          <span className="text-8xl">🦁</span>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          You're Offline
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
          No internet connection detected. Some features may be limited, but you can still explore cached content.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/main"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Return to Dashboard
          </Link>
          
          <p className="text-sm text-gray-400">
            Your connection will automatically restore when available.
          </p>
        </div>
        
        <div className="mt-12 p-6 bg-white/10 backdrop-blur rounded-lg max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-white mb-3">
            Available Offline:
          </h2>
          <ul className="text-left text-gray-300 space-y-2">
            <li>✓ View cached reflections and quotes</li>
            <li>✓ Browse your profile and stats</li>
            <li>✓ Read previous messages</li>
            <li>✓ Explore season information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

