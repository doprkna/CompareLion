'use client';

/**
 * Admin Metrics Dashboard
 * Analytics and usage metrics from beta testing
 * v0.13.2n - Community Growth (extended with viral metrics)
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Activity, Users, MessageCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MetricsData {
  totalEvents: number;
  eventsByType: { [key: string]: number };
  recentEvents: Array<{
    name: string;
    timestamp: number;
    data: any;
  }>;
}

const COLORS = {
  app_start: '#3b82f6', // blue
  question_answered: '#10b981', // green
  feedback_submitted: '#f59e0b', // amber
  error_occurred: '#ef4444', // red
  // Community Growth (v0.13.2n)
  share_clicked: '#8b5cf6', // purple
  invite_generated: '#ec4899', // pink
  challenge_completed: '#14b8a6', // teal
};

export default function AdminMetricsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/metrics');
      
      if (!response.ok) {
        throw new Error('Failed to load metrics');
      }
      
      const data = await response.json();
      setMetrics(data.data);
    } catch (err) {
      console.error('[ADMIN_METRICS] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    loadMetrics();
  }, [session, sessionStatus, router]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadMetrics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Prepare data for charts
  const eventTypeData = metrics ? Object.entries(metrics.eventsByType).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
    displayName: name,
  })) : [];

  if (sessionStatus === 'loading' || loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadMetrics} variant="outline">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-text-secondary mt-1">
            User behavior and engagement metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button onClick={loadMetrics} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics?.totalEvents || 0}</div>
                <div className="text-sm text-text-secondary">Total Events</div>
              </div>
              <Activity className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics?.eventsByType.app_start || 0}</div>
                <div className="text-sm text-text-secondary">App Starts</div>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics?.eventsByType.question_answered || 0}</div>
                <div className="text-sm text-text-secondary">Questions Answered</div>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics?.eventsByType.feedback_submitted || 0}</div>
                <div className="text-sm text-text-secondary">Feedback Submitted</div>
              </div>
              <MessageCircle className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marketing Metrics (v0.15.0) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics?.eventsByType.new_signup || 0}</div>
                <div className="text-sm text-text-secondary">New Signups</div>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics?.eventsByType.waitlist_referral || 0}</div>
                <div className="text-sm text-text-secondary">Waitlist Referrals</div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics?.eventsByType.referral_success || 0}</div>
                <div className="text-sm text-text-secondary">Successful Referrals</div>
              </div>
              <Users className="h-8 w-8 text-pink-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics?.eventsByType.campaign_sent || 0}</div>
                <div className="text-sm text-text-secondary">Campaigns Sent</div>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics (v0.13.2n) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{metrics?.eventsByType.share_clicked || 0}</div>
                <div className="text-sm text-text-secondary">Shares</div>
              </div>
              <span className="text-3xl">📢</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-pink-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-pink-600">{metrics?.eventsByType.invite_generated || 0}</div>
                <div className="text-sm text-text-secondary">Invites Sent</div>
              </div>
              <span className="text-3xl">👥</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-teal-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-teal-600">{metrics?.eventsByType.challenge_completed || 0}</div>
                <div className="text-sm text-text-secondary">Challenges Done</div>
              </div>
              <span className="text-3xl">🎯</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6"
                  name="Events"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.displayName as keyof typeof COLORS] || '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.displayName as keyof typeof COLORS] || '#3b82f6'} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics?.recentEvents && metrics.recentEvents.length > 0 ? (
              metrics.recentEvents.slice(0, 10).map((event, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[event.name as keyof typeof COLORS] || '#3b82f6' }}
                    />
                    <span className="font-medium">{event.name.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-sm text-text-secondary">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-text-secondary py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent events recorded</p>
                <p className="text-sm mt-2">Events will appear here once analytics tracking is enabled</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-text-secondary">
        {autoRefresh && 'Auto-refreshing every 30 seconds • '}
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

