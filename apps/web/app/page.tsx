"use client";
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

const VersionFooter = () => {
  const [version, setVersion] = useState<string>('');
  useEffect(() => {
    apiFetch('/api/changelog')
      .then(d => { if (d.success && d.entries?.length) setVersion(d.entries[0].version); })
      .catch(() => {});
  }, []);
  return (
    <footer className="bg-gray-100 text-center py-4 text-sm text-gray-600">
      Version: {version || 'N/A'} | <Link href="/changelog" className="underline">Changelog</Link>
    </footer>
  );
};

export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center px-4">
          <h1 className="text-5xl font-bold mb-4">PareL</h1>
          <p className="text-xl mb-6">Answer fun questions, compare with others, and level up through gamified insights.</p>
          <Link href="/signup" className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100">
            Sign Up
          </Link>
        </section>
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 border rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">Quiz</h3>
                <p>Engaging single-question screens with progress tracking.</p>
              </div>
              <div className="p-6 border rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">Flows</h3>
                <p>Adaptive question flows with branching and logic.</p>
              </div>
              <div className="p-6 border rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
                <p>Compare your stats locally and globally.</p>
              </div>
              <div className="p-6 border rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">Shop</h3>
                <p>Spend your in-app currency on avatars and wildcards.</p>
              </div>
            </div>
          </div>
        </section>
        {/* Screenshots Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Screenshots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-40 bg-gray-200 rounded-lg"></div>
              <div className="h-40 bg-gray-200 rounded-lg"></div>
              <div className="h-40 bg-gray-200 rounded-lg"></div>
              <div className="h-40 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </section>
      </div>
      <VersionFooter />
    </>
  );
}



