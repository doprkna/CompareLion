'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface TelemetrySummary {
  totalEvents: number;
  events24h: number;
  events7d: number;
}

interface TopEvent {
  type: string;
  count: number;
}

interface AnalyticsData {
  summary: TelemetrySummary;
  topEvents: TopEvent[];
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchAnalytics();
    }
  }, [status, router]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/telemetry');
      
      if (response.status === 403) {
        toast.error('Access denied', {
          description: 'Admin access required',
        });
        router.push('/main');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setData(data);
    } catch (error: any) {
      toast.error('Failed to load analytics', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-text">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-text">Failed to load analytics</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-text">Analytics Dashboard</h1>
          </div>
          <p className="text-subtle">
            Aggregate usage metrics and telemetry data
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            icon={<Activity className="w-6 h-6" />}
            label="Total Events"
            value={data.summary.totalEvents.toLocaleString()}
            color="purple"
          />
          <SummaryCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Last 24 Hours"
            value={data.summary.events24h.toLocaleString()}
            color="blue"
          />
          <SummaryCard
            icon={<Users className="w-6 h-6" />}
            label="Last 7 Days"
            value={data.summary.events7d.toLocaleString()}
            color="green"
          />
        </div>

        {/* Top Events */}
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-text mb-4">
            Top Events (Last 7 Days)
          </h2>
          
          {data.topEvents.length === 0 ? (
            <p className="text-subtle text-center py-8">
              No events recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {data.topEvents.map((event, index) => (
                <div
                  key={event.type}
                  className="flex items-center justify-between p-4 bg-bg rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-text">
                        {formatEventType(event.type)}
                      </div>
                      <div className="text-sm text-subtle">
                        {event.type}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-text">
                      {event.count.toLocaleString()}
                    </div>
                    <div className="text-sm text-subtle">events</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-text">
            🔒 <strong>Privacy:</strong> All analytics respect user privacy settings.
            Users with analytics disabled are not tracked.
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'purple' | 'blue' | 'green';
}) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    green: 'bg-green-500/10 text-green-600 border-green-500/20',
  };

  return (
    <div className={`bg-card rounded-lg shadow-lg p-6 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="font-semibold text-text">{label}</h3>
      </div>
      <p className="text-3xl font-bold text-text">{value}</p>
    </div>
  );
}

function formatEventType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

