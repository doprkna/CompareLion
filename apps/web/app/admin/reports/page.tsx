import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Flag,
  AlertTriangle,
  User,
  MessageSquare,
  HelpCircle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';

interface Report {
  id: string;
  type: string;
  reason: string;
  description: string;
  status: string;
  createdAt: Date;
  reporter: {
    name: string;
    email: string;
  };
  reportedUser?: {
    name: string;
    email: string;
  };
  reportedQuestion?: {
    text: string;
  };
  reportedMessage?: {
    content: string;
  };
}

async function getReports(): Promise<Report[]> {
  const reports = await prisma.report.findMany({
    include: {
      reporter: {
        select: {
          name: true,
          email: true,
        },
      },
      reportedUser: {
        select: {
          name: true,
          email: true,
        },
      },
      reportedQuestion: {
        select: {
          text: true,
        },
      },
      reportedMessage: {
        select: {
          content: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  return reports;
}

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    PENDING: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500', icon: Clock },
    REVIEWED: { label: 'Reviewed', color: 'bg-blue-500/20 text-blue-600 border-blue-500', icon: Eye },
    RESOLVED: { label: 'Resolved', color: 'bg-green-500/20 text-green-600 border-green-500', icon: CheckCircle },
    DISMISSED: { label: 'Dismissed', color: 'bg-red-500/20 text-red-600 border-red-500', icon: XCircle },
  };

  const { label, color, icon: Icon } = config[status as keyof typeof config] || config.PENDING;

  return (
    <Badge className={`${color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const TypeBadge = ({ type }: { type: string }) => {
  const config = {
    USER: { label: 'User', color: 'bg-blue-500/20 text-blue-600 border-blue-500', icon: User },
    QUESTION: { label: 'Question', color: 'bg-green-500/20 text-green-600 border-green-500', icon: HelpCircle },
    MESSAGE: { label: 'Message', color: 'bg-orange-500/20 text-orange-600 border-orange-500', icon: MessageSquare },
    SPAM: { label: 'Spam', color: 'bg-red-500/20 text-red-600 border-red-500', icon: AlertTriangle },
  };

  const { label, color, icon: Icon } = config[type as keyof typeof config] || config.USER;

  return (
    <Badge className={`${color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default async function AdminReportsPage() {
  const reports = await getReports();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Reports & Moderation</h1>
          <p className="text-subtle mt-1">Review and manage user reports and moderation requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Moderation Tools
          </Button>
          <Button variant="outline">
            <Flag className="h-4 w-4 mr-2" />
            View All Reports
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-subtle">Pending Reports</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reports.filter(r => r.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-subtle">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'RESOLVED').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-subtle">User Reports</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reports.filter(r => r.type === 'USER').length}
            </div>
            <p className="text-xs text-muted-foreground">User-related issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-subtle">Content Reports</CardTitle>
            <HelpCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reports.filter(r => ['QUESTION', 'MESSAGE'].includes(r.type)).length}
            </div>
            <p className="text-xs text-muted-foreground">Content issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Recent Reports ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Reported Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <TypeBadge type={report.type} />
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium">{report.reason}</div>
                      {report.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {report.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.reporter.name}</div>
                      <div className="text-sm text-muted-foreground">{report.reporter.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {report.reportedUser && (
                        <div>
                          <div className="font-medium">{report.reportedUser.name}</div>
                          <div className="text-sm text-muted-foreground">{report.reportedUser.email}</div>
                        </div>
                      )}
                      {report.reportedQuestion && (
                        <div className="truncate" title={report.reportedQuestion.text}>
                          {report.reportedQuestion.text}
                        </div>
                      )}
                      {report.reportedMessage && (
                        <div className="truncate" title={report.reportedMessage.content}>
                          {report.reportedMessage.content}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={report.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {reports.length === 0 && (
            <div className="text-center py-8">
              <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">No reports found</h3>
              <p className="text-subtle">All caught up! No reports to review at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

























