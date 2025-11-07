'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ArrowLeft,
  RefreshCw,
  Crown,
  Star,
  Flame,
  Target
} from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

interface User {
  id: string;
  email: string;
  name: string | null;
  level: number;
  xp: number;
  funds: number;
  diamonds: number;
  questionsAnswered: number;
  streakCount: number;
  lastActiveAt: Date | null;
  createdAt: Date;
  role: string;
}

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    loadUsers();
  }, [session, status, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await apiFetch('/api/admin/users');
      if (res.ok && res.data?.data) {
        setUsers(res.data.data);
      } else {
        setError(res.error || 'Failed to load users');
      }
    } catch (err) {
      setError('Network error loading users');
      console.error('Users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { color: 'bg-red-100 text-red-800', icon: <Crown className="h-3 w-3" /> },
      USER: { color: 'bg-blue-100 text-blue-800', icon: <Users className="h-3 w-3" /> },
      MOD: { color: 'bg-green-100 text-green-800', icon: <Star className="h-3 w-3" /> },
      DEVOPS: { color: 'bg-purple-100 text-purple-800', icon: <Target className="h-3 w-3" /> },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {role}
      </Badge>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading users...</p>
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
            <Button onClick={loadUsers} variant="outline">
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
              <h1 className="text-3xl font-bold">Users</h1>
              <p className="text-muted-foreground">
                Top 10 users by XP
              </p>
            </div>
          </div>
          <Button onClick={loadUsers} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Level</th>
                    <th className="text-left p-4 font-medium">XP</th>
                    <th className="text-left p-4 font-medium">Funds</th>
                    <th className="text-left p-4 font-medium">Diamonds</th>
                    <th className="text-left p-4 font-medium">Questions</th>
                    <th className="text-left p-4 font-medium">Streak</th>
                    <th className="text-left p-4 font-medium">Last Active</th>
                    <th className="text-left p-4 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {user.name || user.email.split('@')[0]}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Joined: {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {user.level}
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        {user.xp.toLocaleString()}
                      </td>
                      <td className="p-4 font-mono">
                        {Number(user.funds).toFixed(2)}
                      </td>
                      <td className="p-4 font-mono">
                        {user.diamonds}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-blue-500" />
                          {user.questionsAnswered}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          {user.streakCount}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {formatDate(user.lastActiveAt)}
                      </td>
                      <td className="p-4">
                        {getRoleBadge(user.role)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {users.reduce((sum, user) => sum + user.xp, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {users.reduce((sum, user) => sum + user.questionsAnswered, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Questions Answered</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

























