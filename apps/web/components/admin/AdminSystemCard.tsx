/**
 * AdminSystemCard Component
 * 
 * Displays a card for a system in the Admin Dev Lab
 * v0.30.0 - Admin God View
 */

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, XCircle, Eye, Loader2 } from 'lucide-react';

interface AdminSystemCardProps {
  name: string;
  route: string;
  modelCount: number;
  status: 'active' | 'empty' | 'error';
}

export function AdminSystemCard({ name, route, modelCount, status }: AdminSystemCardProps) {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any>(null);
  const [showRecords, setShowRecords] = useState(false);

  const handleViewRecords = async () => {
    if (showRecords) {
      setShowRecords(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${route}/list?limit=5`);
      const data = await res.json();
      if (data.success && data.data) {
        setRecords(data.data.records);
        setShowRecords(true);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    active: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Active' },
    empty: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Empty' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Error' },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="border-2 border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{name}</CardTitle>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
            <StatusIcon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-subtle text-sm">Records:</span>
            <span className="text-text font-bold text-lg">{modelCount.toLocaleString()}</span>
          </div>
          {showRecords && records && (
            <div className="mt-4 space-y-2">
              {Object.entries(records).map(([modelName, modelRecords]: [string, any]) => (
                <div key={modelName} className="bg-bg rounded-lg p-3 border border-border">
                  <div className="text-xs font-medium text-accent mb-2">{modelName}</div>
                  {Array.isArray(modelRecords) && modelRecords.length > 0 ? (
                    <pre className="text-xs text-subtle overflow-x-auto">
                      {JSON.stringify(modelRecords.slice(0, 2), null, 2)}
                    </pre>
                  ) : (
                    <div className="text-xs text-subtle italic">No records</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleViewRecords}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : showRecords ? (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Hide Records
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              View Raw JSON
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}