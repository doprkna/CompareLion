"use client";
const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
import React, { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${base}/api/login`, { cache: 'no-store',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Login successful!');
        setLoggedIn(true);
      } else {
        setMessage(data.message || 'Login failed.');
        setLoggedIn(false);
      }
    } catch (err) {
      setMessage('An error occurred.');
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setMessage('');
    try {
      await fetch(`${base}/api/logout`, { cache: 'no-store', method: 'POST' });
      setLoggedIn(false);
      setMessage('Logged out.');
    } catch (err) {
      setMessage('Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setMessage('Password reset feature coming soon!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {loggedIn ? (
          <>
            <div className="mb-4 text-green-700 font-semibold text-center">You are logged in!</div>
            <button
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-semibold"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </>
        ) : (
          <>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
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
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <button
              className="w-full mt-4 bg-gray-100 text-blue-700 py-2 rounded hover:bg-gray-200 transition font-semibold border border-blue-200"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              Forgot password?
            </button>
          </>
        )}
        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
