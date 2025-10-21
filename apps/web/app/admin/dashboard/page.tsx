'use client';

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Trophy, Database, Activity, BarChart } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [dbPerf, setDbPerf] = useState<any>(null);

  useEffect(() => {
    loadStats();
    loadDbPerf();
  }, []);

  async function loadStats() {
    const res = await apiFetch("/api/reports");
    if ((res as any).ok && (res as any).data) {
      setStats((res as any).data);
    }
  }

  async function loadDbPerf() {
    const res = await apiFetch("/api/reports/db-performance");
    if ((res as any).ok && (res as any).data) {
      setDbPerf((res as any).data);
    }
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">⚙️ Admin Dashboard</h1>
          <p className="text-subtle">Centralized management and monitoring</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-accent">{stats?.usersCount || 0}</div>
                      <div className="text-sm text-subtle">Total Users</div>
                    </div>
                    <Users className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-accent">{stats?.messagesCount || 0}</div>
                      <div className="text-sm text-subtle">Messages</div>
                    </div>
                    <MessageSquare className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-accent">{stats?.avgXP || 0}</div>
                      <div className="text-sm text-subtle">Avg XP</div>
                    </div>
                    <Trophy className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <Button onClick={() => window.location.href = "/admin/events"} className="gap-2">
                  <Activity className="h-4 w-4" />
                  Manage Events
                </Button>
                <Button onClick={() => window.location.href = "/admin/ui-preview"} variant="outline" className="gap-2">
                  <BarChart className="h-4 w-4" />
                  UI System
                </Button>
                <Button onClick={() => window.location.href = "/reports"} variant="outline" className="gap-2">
                  <Database className="h-4 w-4" />
                  Reports
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {dbPerf && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-card border-border">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-accent">{dbPerf.slowQueries.count}</div>
                      <div className="text-sm text-subtle mt-1">Slow Queries</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-accent">{dbPerf.slowQueries.avgDuration}ms</div>
                      <div className="text-sm text-subtle mt-1">Avg Duration</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-accent">{dbPerf.slowQueries.maxDuration}ms</div>
                      <div className="text-sm text-subtle mt-1">Max Duration</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-card border-border">
                  <CardHeader><CardTitle>Table Counts</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {Object.entries(dbPerf.tableCounts).map(([table, count]) => (
                        <div key={table} className="flex justify-between p-2 bg-bg rounded">
                          <span className="text-subtle">{table}</span>
                          <span className="font-mono text-accent">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}










