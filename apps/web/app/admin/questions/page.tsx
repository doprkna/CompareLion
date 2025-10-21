import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HelpCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  category: {
    name: string;
  };
  difficulty: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    answers: number;
  };
}

async function getQuestions(): Promise<Question[]> {
  const questions = await prisma.question.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          answers: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50, // Limit for performance
  });

  return questions;
}

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const config = {
    EASY: { label: 'Easy', color: 'bg-green-500/20 text-green-600 border-green-500' },
    MEDIUM: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500' },
    HARD: { label: 'Hard', color: 'bg-red-500/20 text-red-600 border-red-500' },
  };

  const { label, color } = config[difficulty as keyof typeof config] || config.MEDIUM;

  return (
    <Badge className={color}>
      {label}
    </Badge>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    ACTIVE: { label: 'Active', color: 'bg-green-500/20 text-green-600 border-green-500', icon: CheckCircle },
    PENDING: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500', icon: Clock },
    REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-600 border-red-500', icon: XCircle },
  };

  const { label, color, icon: Icon } = config[status as keyof typeof config] || config.PENDING;

  return (
    <Badge className={`${color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default async function AdminQuestionsPage() {
  const questions = await getQuestions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Question Management</h1>
          <p className="text-subtle mt-1">Manage and moderate questions in the system</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search questions..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="coffee">Coffee</SelectItem>
                <SelectItem value="sleep">Sleep</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Questions ({questions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Answers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={question.text}>
                      {question.text}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {question.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DifficultyBadge difficulty={question.difficulty} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {question._count.answers}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="ACTIVE" />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {questions.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">No questions found</h3>
              <p className="text-subtle mb-4">Get started by adding your first question.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}







