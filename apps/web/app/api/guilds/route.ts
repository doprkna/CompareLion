import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import * as dbModule from '@/lib/db';
import { safeAsync, successResponse, unauthorizedError, validationError } from '@/lib/api-handler';

const prisma = (dbModule as any).default || (dbModule as any).prisma;

export const GET = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

    // For now, return mock data since guilds table doesn't exist yet
    // This will be replaced with actual database queries once the schema is updated
    const mockGuilds = [
      {
        id: '1',
        name: 'Dragon Slayers',
        description: 'Elite guild focused on high-level content and teamwork',
        memberCount: 8,
        maxMembers: 20,
        level: 15,
        experience: 25000,
        leader: {
          id: 'leader1',
          name: 'Aragorn',
          email: 'aragorn@example.com'
        },
        members: [],
        createdAt: new Date().toISOString(),
        isPublic: true,
        requirements: {
          minLevel: 10,
          minExperience: 5000
        }
      },
      {
        id: '2',
        name: 'Code Warriors',
        description: 'Guild for developers and tech enthusiasts',
        memberCount: 12,
        maxMembers: 25,
        level: 12,
        experience: 18000,
        leader: {
          id: 'leader2',
          name: 'TechMaster',
          email: 'tech@example.com'
        },
        members: [],
        createdAt: new Date().toISOString(),
        isPublic: true,
        requirements: {
          minLevel: 5,
          minExperience: 2000
        }
      },
      {
        id: '3',
        name: 'Mystic Explorers',
        description: 'Adventure-focused guild exploring new territories',
        memberCount: 5,
        maxMembers: 15,
        level: 8,
        experience: 12000,
        leader: {
          id: 'leader3',
          name: 'Explorer',
          email: 'explorer@example.com'
        },
        members: [],
        createdAt: new Date().toISOString(),
        isPublic: false,
        requirements: {
          minLevel: 7,
          minExperience: 3000
        }
      }
    ];

  return successResponse({ data: mockGuilds });
});

export const POST = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const body = await request.json();
  const { name, description, isPublic, maxMembers, requirements } = body;

  // Validate required fields
  if (!name || !description) {
    return validationError('Name and description are required');
  }

    // For now, return a mock response since guilds table doesn't exist yet
    const mockGuild = {
      id: Date.now().toString(),
      name,
      description,
      memberCount: 1,
      maxMembers: maxMembers || 20,
      level: 1,
      experience: 0,
      leader: {
        id: session.user.id,
        name: session.user.name || 'Unknown',
        email: session.user.email
      },
      members: [{
        id: session.user.id,
        name: session.user.name || 'Unknown',
        email: session.user.email,
        role: 'LEADER',
        joinedAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      isPublic: isPublic !== false,
      requirements: requirements || {
        minLevel: 1,
        minExperience: 0
      }
    };

  return successResponse({ data: mockGuild });
});
