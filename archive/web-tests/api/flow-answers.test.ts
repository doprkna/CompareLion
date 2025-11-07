/**
 * Flow Answers API Test Suite
 * Comprehensive testing for the question flow system
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/flow-answers/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    flowQuestion: {
      findUnique: jest.fn(),
    },
    userResponse: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Flow Answers API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DEBUG_API = 'true';
  });

  afterEach(() => {
    delete process.env.DEBUG_API;
  });

  describe('Authentication Tests', () => {
    it('should return 401 when no session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'test-question',
          optionId: 'test-option',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
      expect(data.debug).toBeDefined();
      expect(data.debug.stages).toContainEqual(
        expect.objectContaining({
          stage: 'AUTH_FAILED',
          success: false,
        })
      );
    });

    it('should return 401 when session has no user email', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { name: 'Test User' },
      } as any);

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'test-question',
          optionId: 'test-option',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should proceed when valid session exists', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);

      mockPrisma.flowQuestion.findUnique.mockResolvedValue({
        id: 'question-123',
        isActive: true,
        text: 'Test question',
      } as any);

      mockPrisma.userResponse.findFirst.mockResolvedValue(null);
      mockPrisma.userResponse.create.mockResolvedValue({
        id: 'response-123',
        questionId: 'question-123',
        skipped: false,
        createdAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'question-123',
          optionId: 'option-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.response).toBeDefined();
    });
  });

  describe('User Lookup Tests', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any);
    });

    it('should return 404 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'test-question',
          optionId: 'test-option',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User not found');
    });

    it('should handle database error during user lookup', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'test-question',
          optionId: 'test-option',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database error finding user');
    });
  });

  describe('Request Body Tests', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid JSON in request body');
    });

    it('should return 400 when questionId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          optionId: 'test-option',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('questionId is required');
    });

    it('should return 400 when no answer content provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'test-question',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Must provide optionId, valueText, or mark as skipped');
    });
  });

  describe('Question Lookup Tests', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);
    });

    it('should return 404 when question not found', async () => {
      mockPrisma.flowQuestion.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'non-existent-question',
          optionId: 'test-option',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Question not found: non-existent-question');
    });

    it('should handle mock questions correctly', async () => {
      mockPrisma.flowQuestion.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'cmguq4q5d0000inzr3krujckr-1',
          optionId: 'cmguq4q5d0000inzr3krujckr-opt-1',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.response).toBeDefined();
      expect(data.debug.mockResponse).toBe(true);
    });

    it('should return 400 when question is inactive', async () => {
      mockPrisma.flowQuestion.findUnique.mockResolvedValue({
        id: 'question-123',
        isActive: false,
        text: 'Inactive question',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'question-123',
          optionId: 'test-option',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Question is not active');
    });
  });

  describe('Response Saving Tests', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);
      mockPrisma.flowQuestion.findUnique.mockResolvedValue({
        id: 'question-123',
        isActive: true,
        text: 'Test question',
      } as any);
    });

    it('should create new response when none exists', async () => {
      mockPrisma.userResponse.findFirst.mockResolvedValue(null);
      mockPrisma.userResponse.create.mockResolvedValue({
        id: 'response-123',
        questionId: 'question-123',
        skipped: false,
        createdAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'question-123',
          optionId: 'option-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.response.id).toBe('response-123');
      expect(mockPrisma.userResponse.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          questionId: 'question-123',
          optionId: 'option-123',
          valueText: null,
          skipped: false,
          timeMs: null,
        },
      });
    });

    it('should update existing response', async () => {
      mockPrisma.userResponse.findFirst.mockResolvedValue({
        id: 'existing-response-123',
      } as any);
      mockPrisma.userResponse.update.mockResolvedValue({
        id: 'existing-response-123',
        questionId: 'question-123',
        skipped: false,
        createdAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'question-123',
          optionId: 'option-456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.userResponse.update).toHaveBeenCalledWith({
        where: { id: 'existing-response-123' },
        data: {
          optionId: 'option-456',
          valueText: null,
          skipped: false,
          timeMs: null,
        },
      });
    });

    it('should handle database error during response save', async () => {
      mockPrisma.userResponse.findFirst.mockResolvedValue(null);
      mockPrisma.userResponse.create.mockRejectedValue(new Error('Database save failed'));

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'question-123',
          optionId: 'option-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database error saving response');
    });
  });

  describe('Debug Information Tests', () => {
    beforeEach(() => {
      process.env.DEBUG_API = 'true';
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' },
      } as any);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      } as any);
      mockPrisma.flowQuestion.findUnique.mockResolvedValue({
        id: 'question-123',
        isActive: true,
        text: 'Test question',
      } as any);
      mockPrisma.userResponse.findFirst.mockResolvedValue(null);
      mockPrisma.userResponse.create.mockResolvedValue({
        id: 'response-123',
        questionId: 'question-123',
        skipped: false,
        createdAt: new Date(),
      } as any);
    });

    it('should include debug information in successful response', async () => {
      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'question-123',
          optionId: 'option-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug).toBeDefined();
      expect(data.debug.stages).toBeDefined();
      expect(data.debug.totalTime).toBeDefined();
      expect(data.debug.requestId).toBeDefined();
      expect(data.debug.stages.length).toBeGreaterThan(0);
    });

    it('should include debug information in error response', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/flow-answers', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'question-123',
          optionId: 'option-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.debug).toBeDefined();
      expect(data.debug.stages).toBeDefined();
      expect(data.debug.error).toBeDefined();
    });
  });
});


