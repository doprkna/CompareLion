'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { showInstallPrompt, setupInstallPrompt, isAppInstalled, isIOS } from '@/lib/pwa';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (isAppInstalled()) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Setup install prompt listener
    setupInstallPrompt(() => {
      setShowPrompt(true);
    });

    // For iOS, show manual install instructions after a delay
    if (isIOS() && !isAppInstalled()) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }
  }, []);

  const handleInstall = async () => {
    if (isIOS()) {
      // Show iOS install instructions
      return;
    }

    const accepted = await showInstallPrompt();
    if (accepted) {
      setShowPrompt(false);
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-3xl">
            🦁
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">
              Install PareL App
            </h3>
            <p className="text-sm text-purple-100 mb-3">
              {isIOS() 
                ? 'Tap the Share button and select "Add to Home Screen"'
                : 'Get the full experience with offline access and notifications'
              }
            </p>
            
            {!isIOS() && (
              <button
                onClick={handleInstall}
                className="w-full bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Install Now
              </button>
            )}
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-purple-200 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

