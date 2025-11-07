/**
 * Admin Data Overview Component
 * Displays live database metrics with status indicators
 * v0.13.2i
 */

'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/utils/debug';

interface DBCounts {
  users: number;
  questions: number;
  flowQuestions: number;
  questionGenerations: number;
  achievements: number;
  items: number;
  messages: number;
  notifications: number;
  activities: number;
  auditLogs: number;
}

interface DBCheckResponse {
  status: string;
  timestamp: string;
  counts: DBCounts;
  issues?: string[];
  database: {
    url: string;
    connected: boolean;
  };
}

export function DataOverview() {
  const [data, setData] = useState<DBCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/dbcheck');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      logger.error('Failed to fetch DB check', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 20 seconds
    const interval = setInterval(fetchData, 20000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Database Overview</h2>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h2 className="text-xl font-bold mb-2 text-red-800 dark:text-red-200">Error</h2>
        <p className="text-red-600 dark:text-red-300">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const getStatusColor = (status: string) => {
    if (status === 'ok') return 'bg-green-500';
    if (status === 'warning') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCountColor = (count: number, threshold: number) => {
    if (count >= threshold) return 'text-green-600 dark:text-green-400';
    if (count > 0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Database Overview
          <span className={`w-3 h-3 rounded-full ${getStatusColor(data.status)}`} title={data.status}></span>
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {data.issues && data.issues.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Issues:</p>
          <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
            {data.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Users"
          value={data.counts.users}
          threshold={1}
          colorFn={getCountColor}
        />
        <MetricCard
          label="Questions"
          value={data.counts.questions}
          threshold={10}
          colorFn={getCountColor}
        />
        <MetricCard
          label="Flow Questions"
          value={data.counts.flowQuestions}
          threshold={5}
          colorFn={getCountColor}
        />
        <MetricCard
          label="Generations"
          value={data.counts.questionGenerations}
          threshold={1}
          colorFn={getCountColor}
        />
        <MetricCard
          label="Achievements"
          value={data.counts.achievements}
          threshold={1}
          colorFn={getCountColor}
        />
        <MetricCard
          label="Items"
          value={data.counts.items}
          threshold={1}
          colorFn={getCountColor}
        />
        <MetricCard
          label="Messages"
          value={data.counts.messages}
          threshold={0}
          colorFn={getCountColor}
        />
        <MetricCard
          label="Notifications"
          value={data.counts.notifications}
          threshold={0}
          colorFn={getCountColor}
        />
        <MetricCard
          label="Activities"
          value={data.counts.activities}
          threshold={0}
          colorFn={getCountColor}
        />
        <MetricCard
          label="Audit Logs"
          value={data.counts.auditLogs}
          threshold={0}
          colorFn={getCountColor}
        />
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Database: {data.database.connected ? '🟢 Connected' : '🔴 Disconnected'} | 
        URL: {data.database.url === 'configured' ? 'Configured' : 'Missing'}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  threshold: number;
  colorFn: (count: number, threshold: number) => string;
}

function MetricCard({ label, value, threshold, colorFn }: MetricCardProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorFn(value, threshold)}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}


