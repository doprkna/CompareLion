'use client';

/**
 * Admin Feedback Dashboard
 * View and manage user feedback submissions
 * v0.13.2l - Feedback Review System
 */

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Circle,
  Bug,
  Lightbulb,
  Heart,
  Calendar,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  userId: string;
  type: string;
  category: string | null;
  title: string;
  description: string;
  page: string | null;
  userAgent: string | null;
  priority: string;
  status: string;
  adminNotes: string | null;
  submittedAt: string;
  user?: {
    email: string;
    name: string | null;
  };
}

type CategoryFilter = 'all' | 'bug' | 'idea' | 'praise';
type StatusFilter = 'all' | 'pending' | 'reviewed' | 'in_progress';

export default function AdminFeedbackPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // UI state
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    loadFeedback();
  }, [session, sessionStatus, router]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/feedback');
      
      if (!response.ok) {
        throw new Error('Failed to load feedback');
      }
      
      const data = await response.json();
      setFeedback(data.data || []);
    } catch (err) {
      console.error('[ADMIN_FEEDBACK] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (feedbackId: string, newStatus: string) => {
    try {
      setUpdatingStatus(feedbackId);
      
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Update local state
      setFeedback(prev => 
        prev.map(item => 
          item.id === feedbackId 
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (err) {
      console.error('[ADMIN_FEEDBACK] Update error:', err);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter feedback
  const filteredFeedback = useMemo(() => {
    return feedback.filter(item => {
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDescription = item.description.toLowerCase().includes(query);
        const matchesUser = item.user?.email.toLowerCase().includes(query) || item.user?.name?.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesDescription && !matchesUser) {
          return false;
        }
      }
      
      // Date range filter
      const itemDate = new Date(item.submittedAt);
      if (dateFrom && itemDate < new Date(dateFrom)) {
        return false;
      }
      if (dateTo && itemDate > new Date(dateTo)) {
        return false;
      }
      
      return true;
    });
  }, [feedback, categoryFilter, statusFilter, searchQuery, dateFrom, dateTo]);

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case 'bug':
        return <Bug className="h-4 w-4 text-red-500" />;
      case 'idea':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'praise':
        return <Heart className="h-4 w-4 text-pink-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'bug':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'idea':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'praise':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'reviewed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadFeedback} variant="outline">Try Again</Button>
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
          <h1 className="text-3xl font-bold">Feedback Management</h1>
          <p className="text-text-secondary mt-1">
            Review and respond to user feedback from beta testing
          </p>
        </div>
        <Button onClick={loadFeedback} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{feedback.length}</div>
            <div className="text-sm text-text-secondary">Total Submissions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{feedback.filter(f => f.status === 'pending').length}</div>
            <div className="text-sm text-text-secondary">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{feedback.filter(f => f.category === 'bug').length}</div>
            <div className="text-sm text-text-secondary">Bug Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{feedback.filter(f => f.category === 'idea').length}</div>
            <div className="text-sm text-text-secondary">Feature Ideas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
              className="px-3 py-2 border border-border rounded-md bg-bg"
            >
              <option value="all">All Categories</option>
              <option value="bug">Bug Reports</option>
              <option value="idea">Ideas</option>
              <option value="praise">Praise</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 border border-border rounded-md bg-bg"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="in_progress">In Progress</option>
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-text-secondary">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No feedback found matching your filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(item.category)}
                      <h3 className="font-semibold">{item.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category || 'general'}
                      </Badge>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.user?.email || item.userId}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {item.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(item.id, 'reviewed')}
                        disabled={updatingStatus === item.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Reviewed
                      </Button>
                    )}
                    {item.status === 'reviewed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(item.id, 'pending')}
                        disabled={updatingStatus === item.id}
                      >
                        <Circle className="h-4 w-4 mr-1" />
                        Mark Pending
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    >
                      {expandedItem === item.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                <p className="text-sm text-text-secondary line-clamp-2">
                  {item.description}
                </p>

                {/* Expanded Details */}
                {expandedItem === item.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Full Message:</p>
                      <p className="text-sm text-text-secondary whitespace-pre-wrap">
                        {item.description}
                      </p>
                    </div>
                    {item.page && (
                      <div>
                        <p className="text-sm font-medium mb-1">Page:</p>
                        <p className="text-sm text-text-secondary font-mono">{item.page}</p>
                      </div>
                    )}
                    {item.userAgent && (
                      <div>
                        <p className="text-sm font-medium mb-1">User Agent:</p>
                        <p className="text-xs text-text-secondary font-mono truncate">
                          {item.userAgent}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-text-secondary">
        Showing {filteredFeedback.length} of {feedback.length} submissions
      </div>
    </div>
  );
}

