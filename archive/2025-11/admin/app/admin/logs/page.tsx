'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: string;
}

export default function AdminLogs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    loadLogs();
  }, [session, status, router]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll create some mock log entries
      // In a real implementation, you'd fetch from an API endpoint
      const mockLogs: LogEntry[] = [
        {
          timestamp: new Date().toISOString(),
          level: 'success',
          message: 'Database connection established',
          details: 'Connected to PostgreSQL at localhost:5432'
        },
        {
          timestamp: new Date(Date.now() - 300000).toISOString(),
          level: 'info',
          message: 'Admin dashboard accessed',
          details: 'User admin@example.com viewed admin overview'
        },
        {
          timestamp: new Date(Date.now() - 600000).toISOString(),
          level: 'info',
          message: 'Database seeded successfully',
          details: '1,030+ records created across 64 tables'
        },
        {
          timestamp: new Date(Date.now() - 900000).toISOString(),
          level: 'warn',
          message: 'High memory usage detected',
          details: 'Memory usage at 85% - consider optimization'
        },
        {
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          level: 'error',
          message: 'Failed to connect to Redis',
          details: 'Redis connection timeout after 5 seconds'
        },
        {
          timestamp: new Date(Date.now() - 1500000).toISOString(),
          level: 'info',
          message: 'User login successful',
          details: 'admin@example.com logged in from 127.0.0.1'
        },
        {
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          level: 'success',
          message: 'Application started',
          details: 'PareL v0.12.5 started on port 3002'
        },
        {
          timestamp: new Date(Date.now() - 2100000).toISOString(),
          level: 'info',
          message: 'Environment variables loaded',
          details: 'Loaded .env file with 25 variables'
        },
        {
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          level: 'warn',
          message: 'Prisma client regeneration needed',
          details: 'Schema changes detected, client needs regeneration'
        },
        {
          timestamp: new Date(Date.now() - 2700000).toISOString(),
          level: 'success',
          message: 'System health check passed',
          details: 'All services operational'
        }
      ];

      setLogs(mockLogs);
    } catch (err) {
      setError('Failed to load logs');
      console.error('Logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      success: 'bg-green-100 text-green-800',
      info: 'bg-blue-100 text-blue-800',
      warn: 'bg-orange-100 text-orange-800',
      error: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={`${levelConfig[level as keyof typeof levelConfig]} text-xs`}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading logs...</p>
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
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadLogs} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push('/admin')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">System Logs</h1>
              <p className="text-muted-foreground">
                Recent system activity and events
              </p>
            </div>
          </div>
          <Button onClick={loadLogs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Log Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getLevelIcon(log.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getLevelBadge(log.level)}
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="font-medium">{log.message}</p>
                    {log.details && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {logs.filter(log => log.level === 'success').length}
              </div>
              <div className="text-sm text-muted-foreground">Success</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {logs.filter(log => log.level === 'info').length}
              </div>
              <div className="text-sm text-muted-foreground">Info</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {logs.filter(log => log.level === 'warn').length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(log => log.level === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </CardContent>
          </Card>
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">Note</p>
              <p className="text-sm text-muted-foreground">
                This is a demo implementation showing mock log data. 
                In a production environment, you would connect to a real logging system 
                or implement a proper log file reader API endpoint.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

























