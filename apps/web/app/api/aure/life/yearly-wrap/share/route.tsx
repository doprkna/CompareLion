/**
 * AURE Life Engine - Yearly Wrap Share Card API
 * Generate shareable PNG card for yearly wrap
 * v0.39.4 - AURE Yearly Wrap
 */

import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { generateYearlyWrap } from '@/lib/aure/life/yearlyWrapService';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * GET /api/aure/life/yearly-wrap/share?wrapId=XYZ
 * Generate shareable PNG card for yearly wrap
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const wrapId = searchParams.get('wrapId');

    if (!wrapId) {
      return new Response('wrapId is required', { status: 400 });
    }

    // Extract year from wrapId (format: userId-year-timestamp)
    const parts = wrapId.split('-');
    const year = parts.length > 1 ? parseInt(parts[parts.length - 2], 10) : new Date().getFullYear();

    // Generate wrap data
    const wrap = await generateYearlyWrap(user.id, year);

    // Get top category
    const topCategory = Object.entries(wrap.categoryBreakdown)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    // Generate image
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Card Container */}
          <div
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              width: '800px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Parel
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#666',
                }}
              >
                {year} Wrap
              </div>
            </div>

            {/* Archetype Evolution */}
            {wrap.archetypeHistory.lastArchetype && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '16px',
                  background: '#f5f7fa',
                  borderRadius: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#333',
                  }}
                >
                  Your Archetype Evolution
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    color: '#666',
                    textTransform: 'capitalize',
                  }}
                >
                  {wrap.archetypeHistory.evolution}
                </div>
              </div>
            )}

            {/* Top Category */}
            <div
              style={{
                marginBottom: '20px',
                padding: '16px',
                background: '#f5f7fa',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#333',
                }}
              >
                Top Category
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#667eea',
                  textTransform: 'capitalize',
                }}
              >
                {topCategory}
              </div>
            </div>

            {/* Best Item */}
            {wrap.topItems.length > 0 && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '16px',
                  background: '#f5f7fa',
                  borderRadius: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#333',
                  }}
                >
                  Best Item of the Year
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    color: '#666',
                    textTransform: 'capitalize',
                  }}
                >
                  {wrap.topItems[0].category} • Score: {wrap.topItems[0].totalScore}
                </div>
              </div>
            )}

            {/* Vibe Summary (truncated) */}
            <div
              style={{
                marginBottom: '20px',
                padding: '16px',
                background: '#f5f7fa',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#333',
                }}
              >
                Your Vibe Summary
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5',
                }}
              >
                {wrap.vibeStory.substring(0, 200)}...
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: '20px',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: '#999',
                }}
              >
                parel.app
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#999',
                }}
              >
                {wrap.timelineStats.totalEvents} events • {Object.keys(wrap.categoryBreakdown).length} categories
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800,
      }
    );
  } catch (error: any) {
    logger.error('[AURE Life] Failed to generate wrap share card', { error });
    return new Response('Failed to generate wrap card', { status: 500 });
  }
}

