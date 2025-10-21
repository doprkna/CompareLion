/**
 * Social Login Buttons Component
 * 
 * Displays OAuth provider buttons with icons
 * Shows active and inactive (coming soon) providers
 */

"use client";

import { signIn } from "next-auth/react";

interface Provider {
  id: string;
  name: string;
  icon: React.ReactNode;
  active: boolean;
  bgColor: string;
  hoverColor: string;
}

const providers: Provider[] = [
  {
    id: "google",
    name: "Google",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    active: !!process.env.NEXT_PUBLIC_GOOGLE_ENABLED || true,
    bgColor: "bg-white border border-gray-300",
    hoverColor: "hover:bg-gray-50",
  },
  {
    id: "email",
    name: "Email",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    active: !!process.env.NEXT_PUBLIC_EMAIL_ENABLED || true,
    bgColor: "bg-gray-700",
    hoverColor: "hover:bg-gray-800",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    active: !!process.env.NEXT_PUBLIC_FACEBOOK_ENABLED || false,
    bgColor: "bg-[#1877F2]",
    hoverColor: "hover:bg-[#166FE5]",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    active: !!process.env.NEXT_PUBLIC_TWITTER_ENABLED || false,
    bgColor: "bg-black",
    hoverColor: "hover:bg-gray-900",
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
      </svg>
    ),
    active: !!process.env.NEXT_PUBLIC_REDDIT_ENABLED || false,
    bgColor: "bg-[#FF4500]",
    hoverColor: "hover:bg-[#E63E00]",
  },
];

export function SocialLoginButtons() {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Continue with
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => provider.active && signIn(provider.id, { callbackUrl: '/main' })}
            disabled={!provider.active}
            className={`
              w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md
              font-medium text-sm transition-all duration-200
              ${provider.active 
                ? `${provider.bgColor} ${provider.hoverColor} text-white shadow-sm hover:shadow` 
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'}
            `}
            title={provider.active ? `Sign in with ${provider.name}` : `${provider.name} - Coming soon`}
          >
            <span className={provider.active ? "" : "opacity-50"}>
              {provider.icon}
            </span>
            <span>{provider.name}</span>
            {!provider.active && (
              <span className="ml-auto text-xs bg-gray-300 dark:bg-gray-700 px-2 py-0.5 rounded">
                Soon
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Or use demo account
          </span>
        </div>
      </div>
    </div>
  );
}

