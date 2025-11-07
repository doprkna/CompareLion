'use client';

/**
 * Admin Error Triage Dashboard (v0.14.0)
 * View, sort, and manage application errors
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  TrendingUp,
  Clock,
  Filter,
} from 'lucide-react';

interface ErrorLog {
  id: string;
  errorType: string;
  message: string;
  page?: string;
  severity: string;
  frequency: number;
  firstSeen: string;
  lastSeen: string;
  status: string;
  resolved: boolean;
  createdAt: string;
}

interface ErrorStats {
  total: number;
  critical: number;
  unresolved: number;
  last24h: number;
}

const SEVERITY_ICONS = {
  critical: AlertTriangle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
};

const SEVERITY_COLORS = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  error: 'text-orange-600 bg-orange-50 border-orange-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
};

export default function AdminErrorsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    critical: 0,
    unresolved: 0,
    last24h: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'frequency' | 'lastSeen' | 'createdAt'>('frequency');
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [filterResolved, setFilterResolved] = useState<boolean | null>(false);

  const loadErrors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: '100',
        sortBy,
      });
      
      if (filterSeverity) params.set('severity', filterSeverity);
      if (filterResolved !== null) params.set('resolved', String(filterResolved));
      
      const response = await fetch(`/api/errors?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load errors');
      }
      
      const data = await response.json();
      setErrors(data.errors || []);
      
      // Calculate stats
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      
      setStats({
        total: data.errors.length,
        critical: data.errors.filter((e: ErrorLog) => e.severity === 'critical').length,
        unresolved: data.errors.filter((e: ErrorLog) => !e.resolved).length,
        last24h: data.errors.filter((e: ErrorLog) => 
          new Date(e.lastSeen).getTime() > oneDayAgo
        ).length,
      });
    } catch (err) {
      console.error('[ADMIN_ERRORS] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load errors');
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

    loadErrors();
  }, [session, sessionStatus, router, sortBy, filterSeverity, filterResolved]);

  if (sessionStatus === 'loading' || (loading && errors.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Triage</h1>
          <p className="text-text-secondary mt-1">
            Monitor and resolve application errors
          </p>
        </div>
        <Button onClick={loadErrors} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-text-secondary">Total Errors</div>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                <div className="text-sm text-text-secondary">Critical</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.unresolved}</div>
                <div className="text-sm text-text-secondary">Unresolved</div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.last24h}</div>
                <div className="text-sm text-text-secondary">Last 24h</div>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-text-secondary" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="frequency">Frequency</option>
                <option value="lastSeen">Last Seen</option>
                <option value="createdAt">Created At</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Severity:</span>
              <select
                value={filterSeverity || ''}
                onChange={(e) => setFilterSeverity(e.target.value || null)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="">All</option>
                <option value="critical">Critical</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Status:</span>
              <select
                value={filterResolved === null ? 'all' : filterResolved ? 'resolved' : 'unresolved'}
                onChange={(e) => {
                  if (e.target.value === 'all') setFilterResolved(null);
                  else setFilterResolved(e.target.value === 'resolved');
                }}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs ({errors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 mb-4 p-4 bg-red-50 rounded">
              {error}
            </div>
          )}
          
          {errors.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No errors found</p>
              <p className="text-sm mt-2">
                {filterResolved === false ? 'All errors have been resolved!' : 'No errors match the current filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((err) => {
                const SeverityIcon = SEVERITY_ICONS[err.severity as keyof typeof SEVERITY_ICONS] || AlertCircle;
                const severityColor = SEVERITY_COLORS[err.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.error;
                
                return (
                  <div 
                    key={err.id}
                    className={`p-4 rounded-lg border ${severityColor} ${err.resolved ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <SeverityIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{err.errorType}</h3>
                            <Badge variant="outline" className="text-xs">
                              {err.frequency}x
                            </Badge>
                            {err.resolved && (
                              <Badge variant="outline" className="text-xs bg-green-50">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2 break-words">{err.message}</p>
                          {err.page && (
                            <p className="text-xs text-text-secondary">
                              Page: <code className="bg-bg px-1 rounded">{err.page}</code>
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                            <span>First: {new Date(err.firstSeen).toLocaleString()}</span>
                            <span>Last: {new Date(err.lastSeen).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

