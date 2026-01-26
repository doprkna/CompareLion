"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Users, Mail, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WaitlistEntry {
  id: string;
  email: string;
  refCode: string | null;
  source: string;
  status: string;
  createdAt: string;
}

export default function AdminWaitlistPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const res = await fetch('/api/admin/waitlist');
      const data = await res.json();
      
      if (data.success) {
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching waitlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    setExporting(true);
    
    try {
      // Create CSV content
      const headers = ['Email', 'Referral Code', 'Source', 'Status', 'Created At'];
      const rows = entries.map(entry => [
        entry.email,
        entry.refCode || '',
        entry.source,
        entry.status,
        new Date(entry.createdAt).toISOString()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  const stats = {
    total: entries.length,
    pending: entries.filter(e => e.status === 'pending').length,
    withReferral: entries.filter(e => e.refCode).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Waitlist Management</h1>
          <p className="text-subtle">Manage and export beta waitlist signups</p>
        </div>
        <Button
          onClick={exportCSV}
          disabled={exporting || entries.length === 0}
          className="bg-accent hover:bg-accent/90"
        >
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{stats.total}</div>
                <div className="text-sm text-subtle">Total Signups</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{stats.pending}</div>
                <div className="text-sm text-subtle">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{stats.withReferral}</div>
                <div className="text-sm text-subtle">With Referral</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-subtle">
              No waitlist entries yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-sm font-semibold text-text">Email</th>
                    <th className="text-left p-3 text-sm font-semibold text-text">Referral</th>
                    <th className="text-left p-3 text-sm font-semibold text-text">Source</th>
                    <th className="text-left p-3 text-sm font-semibold text-text">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-text">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border hover:bg-card/50">
                      <td className="p-3 text-sm text-text">{entry.email}</td>
                      <td className="p-3 text-sm text-subtle">
                        {entry.refCode || '-'}
                      </td>
                      <td className="p-3 text-sm text-subtle">{entry.source}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          entry.status === 'pending' 
                            ? 'bg-yellow-500/10 text-yellow-500' 
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-subtle">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

