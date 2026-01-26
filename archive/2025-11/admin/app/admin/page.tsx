'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Trophy, 
  HelpCircle, 
  Package, 
  MessageSquare, 
  Bell, 
  Calendar,
  Database,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

interface AdminOverview {
  users: number;
  questions: number;
  achievements: number;
  items: number;
  messages: number;
  notifications: number;
  worldEvents: number;
  lastSeed: string | null;
  databaseUrl: string;
  timestamp: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  status: 'success' | 'warning' | 'error';
}

function StatCard({ title, value, icon, description, status }: StatCardProps) {
  const statusColors = {
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-orange-600 bg-orange-50 border-orange-200',
    error: 'text-red-600 bg-red-50 border-red-200',
  };

  const statusIcons = {
    success: <CheckCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
  };

  return (
    <Card className={`${statusColors[status]} border-2`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {statusIcons[status]}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reseedLoading, setReseedLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    loadOverview();
  }, [session, status, router]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await apiFetch('/api/admin/overview');
      if (res.ok && res.data?.data) {
        setOverview(res.data.data);
      } else {
        setError(res.error || 'Failed to load admin overview');
      }
    } catch (err) {
      setError('Network error loading admin overview');
      console.error('Admin overview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReseed = async () => {
    if (!confirm('Are you sure you want to reseed the database? This will reset all data.')) {
      return;
    }

    try {
      setReseedLoading(true);
      const res = await apiFetch('/api/admin/reseed', { method: 'POST' });
      
      if (res.ok) {
        alert('Database reseeded successfully!');
        loadOverview(); // Refresh the overview
      } else {
        alert(`Reseed failed: ${res.error}`);
      }
    } catch (err) {
      alert('Network error during reseed');
      console.error('Reseed error:', err);
    } finally {
      setReseedLoading(false);
    }
  };

  const handleExport = () => {
    if (!overview) return;
    
    const dataStr = JSON.stringify(overview, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-overview-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Admin Access Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadOverview} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <p>No data available</p>
          <Button onClick={loadOverview} variant="outline" className="mt-4">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const getStatus = (value: number): 'success' | 'warning' | 'error' => {
    if (value > 0) return 'success';
    if (value === 0) return 'warning';
    return 'error';
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Database health and statistics overview
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleReseed} 
              disabled={reseedLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${reseedLoading ? 'animate-spin' : ''}`} />
              Reseed DB
            </Button>
            <Button 
              onClick={handleExport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Metrics
            </Button>
            <Button onClick={loadOverview} variant="outline">
              Refresh
            </Button>
          </div>
        </div>

        {/* Color Legend */}
        <div className="mb-6 p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Status Legend</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Healthy (data present)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <span>Warning (no data)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span>Error (critical issue)</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Users"
            value={overview.users}
            icon={<Users className="h-4 w-4" />}
            description="registered users"
            status={getStatus(overview.users)}
          />
          <StatCard
            title="Questions"
            value={overview.questions}
            icon={<HelpCircle className="h-4 w-4" />}
            description="available questions"
            status={getStatus(overview.questions)}
          />
          <StatCard
            title="Achievements"
            value={overview.achievements}
            icon={<Trophy className="h-4 w-4" />}
            description="unlockable achievements"
            status={getStatus(overview.achievements)}
          />
          <StatCard
            title="Items"
            value={overview.items}
            icon={<Package className="h-4 w-4" />}
            description="shop items"
            status={getStatus(overview.items)}
          />
          <StatCard
            title="Messages"
            value={overview.messages}
            icon={<MessageSquare className="h-4 w-4" />}
            description="user messages"
            status={getStatus(overview.messages)}
          />
          <StatCard
            title="Notifications"
            value={overview.notifications}
            icon={<Bell className="h-4 w-4" />}
            description="system notifications"
            status={getStatus(overview.notifications)}
          />
          <StatCard
            title="World Events"
            value={overview.worldEvents}
            icon={<Calendar className="h-4 w-4" />}
            description="active events"
            status={getStatus(overview.worldEvents)}
          />
        </div>

        {/* System Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Connection</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {overview.databaseUrl.replace(/\/\/.*@/, '//***:***@')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(overview.timestamp).toLocaleString()}
                </p>
              </div>
              {overview.lastSeed && (
                <div>
                  <p className="text-sm font-medium">Last Seed</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(overview.lastSeed).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => router.push('/admin/users')}
                  variant="outline"
                  className="justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Users
                </Button>
                <Button 
                  onClick={() => router.push('/main')}
                  variant="outline"
                  className="justify-start"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Back to App
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Admin Dashboard v0.13.2j • Last updated: {new Date(overview.timestamp).toLocaleString()}</p>
          <p className="mt-1">🧪 PareL – Test Build v0.13.2j</p>
        </div>
      </div>
    </div>
  );
}