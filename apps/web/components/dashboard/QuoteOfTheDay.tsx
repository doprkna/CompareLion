'use client';

/**
 * Quote of the Day Banner
 * v0.19.5 - Daily motivation with caching
 */

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
}

export function QuoteOfTheDay() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchQuote();
    // Fade in animation
    setTimeout(() => setVisible(true), 100);
  }, []);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      // Check localStorage for cached quote
      const cachedQuoteData = localStorage.getItem('parel_daily_quote');
      const today = new Date().toISOString().split('T')[0];

      if (cachedQuoteData) {
        const cached = JSON.parse(cachedQuoteData);
        if (cached.date === today) {
          setQuote(cached.quote);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh quote
      const response = await fetch('/api/ai/quote');
      if (response.ok) {
        const data = await response.json();
        setQuote(data.quote);
        
        // Cache in localStorage
        localStorage.setItem('parel_daily_quote', JSON.stringify({
          quote: data.quote,
          date: today,
        }));
      }
    } catch (error) {
      logger.error('Failed to fetch quote', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    // Clear cache and refetch
    localStorage.removeItem('parel_daily_quote');
    setVisible(false);
    setTimeout(() => {
      fetchQuote();
      setTimeout(() => setVisible(true), 100);
    }, 300);
  };

  if (loading && !quote) {
    return (
      <div className="w-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="animate-pulse flex items-center justify-center space-x-4">
          <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div
      className={`w-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 rounded-lg p-6 shadow-sm transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="text-3xl mt-1">💭</div>
            <div className="flex-1">
              <blockquote className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 leading-relaxed">
                "{quote.text}"
              </blockquote>
              <cite className="text-sm text-gray-600 dark:text-gray-400 not-italic">
                — {quote.author}
              </cite>
              <span className="ml-3 text-xs text-purple-600 dark:text-purple-400 font-medium">
                #{quote.category}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          className="flex-shrink-0 p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-200 group"
          title="Refresh quote (changes daily)"
        >
          <svg
            className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:rotate-180 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
      
      {/* Decorative element */}
      <div className="mt-4 h-1 w-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
    </div>
  );
}

