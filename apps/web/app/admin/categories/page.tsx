'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Filter,
  RefreshCcw,
  LayoutDashboard,
  BookOpen,
} from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import dayjs from 'dayjs';

interface CategoryHealth {
  id: string;
  name: string;
  description: string | null;
  questions: number;
  targets: number;
  completion: number;
  status: 'empty' | 'low' | 'partial' | 'complete';
  lastUpdated: string;
  color: string;
  needsQuestions: number;
}

interface CategoryHealthData {
  categories: CategoryHealth[];
  summary: {
    totalCategories: number;
    emptyCategories: number;
    lowCategories: number;
    partialCategories: number;
    completeCategories: number;
    totalQuestions: number;
    totalNeeded: number;
  };
}

const fetcher = (url: string) => apiFetch(url).then(res => {
  if (!res.ok) {
    throw new Error(res.error || 'Failed to fetch data');
  }
  return res.data;
});

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    empty: { label: 'Empty', color: 'bg-red-500/20 text-red-600 border-red-500', icon: AlertCircle },
    low: { label: 'Low', color: 'bg-orange-500/20 text-orange-600 border-orange-500', icon: AlertCircle },
    partial: { label: 'Partial', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500', icon: Clock },
    complete: { label: 'Complete', color: 'bg-green-500/20 text-green-600 border-green-500', icon: CheckCircle },
  };

  const { label, color, icon: Icon } = config[status as keyof typeof config] || config.empty;

  return (
    <Badge className={`${color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const CategoryCard = ({ category }: { category: CategoryHealth }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
            {category.description && (
              <CardDescription className="mt-1">{category.description}</CardDescription>
            )}
          </div>
          <StatusBadge status={category.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{category.completion}%</span>
          </div>
          <Progress value={category.completion} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{category.questions} questions</span>
            <span>Target: {category.targets}</span>
          </div>
        </div>

        {category.status !== 'complete' && (
          <div className="text-sm text-muted-foreground">
            Needs {category.needsQuestions} more questions to complete
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Last updated: {dayjs(category.lastUpdated).format('MMM D, YYYY')}
        </div>
      </CardContent>
    </Card>
  );
};

export default function CategoryHealthPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data, error, isLoading, mutate } = useSWR<CategoryHealthData>('/api/categories/health', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('completion-asc');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/main');
    }
  }, [session, status, router]);

  const filteredCategories = data?.categories
    ?.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case 'completion-asc':
          return a.completion - b.completion;
        case 'completion-desc':
          return b.completion - a.completion;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'questions-asc':
          return a.questions - b.questions;
        case 'questions-desc':
          return b.questions - a.questions;
        default:
          return a.completion - b.completion;
      }
    }) || [];

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <SkeletonLoader type="card" count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Card className="bg-card border-2 border-border max-w-lg">
          <CardContent className="p-6">
            <EmptyState
              icon={AlertCircle}
              title="Category Health Error"
              description={`Failed to load category data: ${error.message}. Please ensure you are logged in as an ADMIN and the backend is running.`}
              action={
                <div className="flex gap-3">
                  <Button onClick={() => mutate()} variant="outline">
                    <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
                  </Button>
                  <Button onClick={() => router.push('/login')}>
                    Back to Login
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6 text-text">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Category Health Dashboard</h1>
            <p className="text-subtle mt-2">Monitor and improve question coverage across all categories</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" passHref>
              <Button variant="outline">
                <LayoutDashboard className="h-4 w-4 mr-2" /> Back to Admin
              </Button>
            </Link>
            <Button onClick={() => mutate()} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {data?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-subtle">Total Categories</CardTitle>
                <BookOpen className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.totalCategories}</div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-subtle">Complete</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{data.summary.completeCategories}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((data.summary.completeCategories / data.summary.totalCategories) * 100)}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-subtle">Needs Help</CardTitle>
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {data.summary.emptyCategories + data.summary.lowCategories}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.emptyCategories} empty, {data.summary.lowCategories} low
                </p>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-subtle">Total Questions</CardTitle>
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.totalQuestions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.totalNeeded} more needed
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="empty">Empty</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completion-asc">Lowest % Complete</SelectItem>
                <SelectItem value="completion-desc">Highest % Complete</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="questions-asc">Fewest Questions</SelectItem>
                <SelectItem value="questions-desc">Most Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <Card className="p-8">
            <EmptyState
              icon={BookOpen}
              title="No Categories Found"
              description="No categories match your current filters. Try adjusting your search or filter criteria."
            />
          </Card>
        )}
      </div>
    </div>
  );
}








