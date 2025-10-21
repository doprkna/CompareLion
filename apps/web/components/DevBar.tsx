/**
 * Development Mode Indicator
 * 
 * Shows a small banner in development mode
 * - Only visible when NODE_ENV !== "production"
 * - Helps identify dev vs prod environment
 * - Reminds to check console for logs
 */

"use client";

import { useState, useEffect } from "react";

export function DevBar() {
  const [isDev, setIsDev] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV !== "production");
  }, []);

  if (!isDev || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-400/10 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs p-1 text-center z-50 border-t border-yellow-400/30">
      <div className="flex items-center justify-center space-x-4">
        <span className="font-medium">
          🛠️ DEV MODE — Check console for API logs
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-yellow-700 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-200 transition-colors"
          aria-label="Close dev bar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Environment Badge
 * Shows current environment in corner
 */
export function EnvBadge() {
  const [env, setEnv] = useState<string>("");

  useEffect(() => {
    setEnv(process.env.NODE_ENV || "unknown");
  }, []);

  if (env === "production") return null;

  return (
    <div className="fixed top-2 right-2 z-50">
      <div className="bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950 px-2 py-1 rounded text-xs font-bold shadow-lg">
        {env.toUpperCase()}
      </div>
    </div>
  );
}

/**
 * Debug Panel (expandable)
 */
export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [info, setInfo] = useState({
    env: "",
    nextVersion: "",
    platform: "",
    userAgent: "",
  });

  useEffect(() => {
    setIsDev(process.env.NODE_ENV !== "production");
    setInfo({
      env: process.env.NODE_ENV || "unknown",
      nextVersion: process.env.NEXT_PUBLIC_VERSION || "unknown",
      platform: typeof window !== "undefined" ? window.navigator.platform : "server",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
    });
  }, []);

  if (!isDev) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-colors"
          aria-label="Open debug panel"
        >
          🐛
        </button>
      ) : (
        <div className="bg-gray-900 text-gray-100 rounded-lg shadow-2xl p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Debug Info</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Close debug panel"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-400">Environment:</span>{" "}
              <span className="text-yellow-400 font-mono">{info.env}</span>
            </div>
            <div>
              <span className="text-gray-400">Next Version:</span>{" "}
              <span className="font-mono">{info.nextVersion}</span>
            </div>
            <div>
              <span className="text-gray-400">Platform:</span>{" "}
              <span className="font-mono">{info.platform}</span>
            </div>
            <div>
              <span className="text-gray-400">Verbose Errors:</span>{" "}
              <span className="font-mono">
                {process.env.NEXT_PUBLIC_VERBOSE_ERRORS || "false"}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-700">
            <button
              onClick={() => console.log("Environment Info:", info)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-1.5 rounded transition-colors"
            >
              Log to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

