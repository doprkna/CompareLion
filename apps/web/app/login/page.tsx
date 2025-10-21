"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { securityConfig } from '@/lib/config/security';
import { SocialLoginButtons } from '@/components/SocialLoginButtons';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/main');
    }
  }, [status, session, router]);

  useEffect(() => {
    // Load hCaptcha script if enabled
    if (securityConfig.captchaEnabled && !document.getElementById('hcaptcha-script')) {
      const script = document.createElement('script');
      script.id = 'hcaptcha-script';
      script.src = 'https://js.hcaptcha.com/1/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Use NextAuth signIn for proper session handling
      const result = await signIn('credentials', {
        email: username,
        password: password,
        redirect: false, // Handle redirect manually
      });
      
      if (result?.error) {
        // Show specific error message from our auth configuration
        let errorMessage = 'Login failed. Please try again.';
        
        if (result.error === 'CredentialsSignin') {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (result.error.includes('User not found')) {
          errorMessage = 'User not found. Please check your email address.';
        } else if (result.error.includes('Incorrect password')) {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (result.error.includes('Account not set up')) {
          errorMessage = 'Account not set up for password login. Please use a different sign-in method.';
        } else if (result.error.includes('Email and password are required')) {
          errorMessage = 'Please enter both email and password.';
        } else if (process.env.NODE_ENV === 'development') {
          errorMessage = result.error;
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      if (result?.ok) {
        // Login successful - redirect to main
        router.push('/main');
        router.refresh(); // Refresh to update session
      } else {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? `Network error: ${err instanceof Error ? err.message : 'Unknown error'}`
        : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError('');
    try {
      // Use NextAuth signOut for proper session cleanup
      const { signOut } = await import('next-auth/react');
      await signOut({ redirect: false });
      setError('Logged out successfully.');
      router.push('/login');
    } catch (err) {
      setError('Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setError('Password reset feature coming soon!');
  };

  // clear error on input change
  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setError('');
  };

  // Setup hCaptcha callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).onCaptchaSuccess = (token: string) => {
        setCaptchaToken(token);
        setError(''); // Clear error when captcha is completed
      };
    }
  }, []);

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // If authenticated, show redirect message (useEffect will redirect)
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Sign in to continue to PareL
        </p>
        
        {/* Removed loggedIn state - handled by useSession above */}
        {(
          <>
            {/* Social Login Buttons */}
            <SocialLoginButtons />
            
            <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="username"
                  value={username}
                  onChange={handleChange(setUsername)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="current-password"
                  value={password}
                  onChange={handleChange(setPassword)}
                  required
                />
              </div>
              {/* hCaptcha Widget - only show if captcha is enabled and required */}
              {(securityConfig.captchaEnabled || showCaptcha) && (
                <div className="flex justify-center">
                  <div
                    className="h-captcha"
                    data-sitekey={securityConfig.hCaptchaSiteKey}
                    data-callback="onCaptchaSuccess"
                  />
                </div>
              )}
              
              {/* Demo bypass indicator */}
              {securityConfig.demoBypass && !securityConfig.captchaEnabled && (
                <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
                  🛠️ Demo mode - Security verification bypassed
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || (showCaptcha && !captchaToken)}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
            <button
              className="w-full mt-4 bg-gray-100 text-blue-700 py-2 rounded hover:bg-gray-200 transition font-semibold border border-blue-200"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              Forgot password?
            </button>
          </>
        )}
      </div>
    </div>
  );
}
