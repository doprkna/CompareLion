"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { isFromDemoResultHandoff } from '@/lib/auth/demoResultHandoff';
import { useSession } from 'next-auth/react';
import { getApiUrl } from '@/lib/apiBase';

export default function SignupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromDemoResult = isFromDemoResultHandoff(searchParams.get('from'));
  const nextParam = searchParams.get('next');
  const loginQuery = new URLSearchParams();
  if (nextParam) loginQuery.set('next', nextParam);
  if (fromDemoResult) loginQuery.set('from', 'demo-result');
  const loginHref = loginQuery.toString() ? `/login?${loginQuery.toString()}` : '/login';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isDuplicateEmailError, setIsDuplicateEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const resolveDestination = async (): Promise<string> => {
    try {
      const res = await fetch('/api/onboarding/start', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      return data?.data?.currentState?.onboardingCompleted ? '/main' : '/onboarding';
    } catch {
      return '/main';
    }
  };
  
  // Redirect if already logged in based on onboarding state.
  useEffect(() => {
    if (status !== 'authenticated' || !session) return;
    void (async () => {
      const destination = await resolveDestination();
      router.replace(destination);
    })();
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsDuplicateEmailError(false);
    try {
      const res = await fetch(getApiUrl('/api/signup'), { cache: 'no-store',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password }),
      });
      const data = await res.json();
      if (data.success) {
        // Keep current auth flow unchanged: signup endpoint does not establish session.
        router.push('/login?next=/onboarding');
      } else {
        const rawError = typeof data?.error === 'string' ? data.error : '';
        const looksDuplicate =
          res.status === 409 ||
          data?.code === 'ACCOUNT_EXISTS' ||
          /already exists|already registered|account exists/i.test(rawError);

        if (looksDuplicate) {
          setIsDuplicateEmailError(true);
          setMessage('An account with this email already exists. Log in instead.');
        } else if (rawError && rawError.length <= 160) {
          setMessage(rawError);
        } else {
          setMessage('Create account failed.');
        }
      }
    } catch {
      setMessage('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">
          {fromDemoResult ? 'Save your comparison results' : 'Create account'}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {fromDemoResult
            ? 'Create an account to keep your answers and unlock real comparisons by country, age, and life situation.'
            : 'Create your account to continue to PareL'}
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">{message}</p>}
        {isDuplicateEmailError ? (
          <p className="mt-2 text-center text-sm text-gray-700 dark:text-gray-300">
            <Link href={loginHref} className="text-blue-500 hover:text-blue-400 font-medium">
              Log in
            </Link>{' '}
            to continue with your existing account.
          </p>
        ) : null}
        <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
          Log in once and we&apos;ll start your onboarding flow.
        </p>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href={loginHref} className="text-blue-500 hover:text-blue-400 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
