/**
 * Rating Share Card API
 * Generate shareable PNG card for rating results
 * v0.38.10 - Shareable Rating Card (PNG Export)
 */

import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { getRatingResult } from '@/lib/rating/ratingService';
import { generateFlavorText } from '@/lib/rating/ratingService';
import { getCategoryPreset } from '@/lib/rating/presets';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/rating/share-card
 * Generate shareable PNG card for a rating result
 * Body: { requestId }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { requestId } = body;

    if (!requestId) {
      return new Response('requestId is required', { status: 400 });
    }

    // Get rating request and result
    const request = await prisma.ratingRequest.findUnique({
      where: { id: requestId },
      include: {
        result: true,
      },
    });

    if (!request || !request.result) {
      return new Response('Rating result not found', { status: 404 });
    }

    const preset = getCategoryPreset(request.category);
    if (!preset) {
      return new Response('Category preset not found', { status: 404 });
    }

    const metrics = request.result.metrics as Record<string, number>;
    const summaryText = request.result.summaryText;
    const roastText = request.result.roastText;

    // Get flavor text (optional)
    let flavorCompliment = '';
    let flavorRoast = '';
    try {
      const flavor = await generateFlavorText(requestId);
      flavorCompliment = flavor.compliment;
      flavorRoast = flavor.roast;
    } catch (error) {
      // Use roastText as fallback
      flavorRoast = roastText;
    }

    // Generate image
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
              width: '700px',
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
                  fontSize: '32px',
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
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#666',
                  textTransform: 'capitalize',
                }}
              >
                {preset.name} Rating
              </div>
            </div>

            {/* Main Image Preview (if available) */}
            {request.imageUrl && (
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '24px',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={request.imageUrl}
                  alt="Rated content"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {/* Metrics */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              {preset.metrics.slice(0, 5).map((metric) => {
                const value = metrics[metric.id] || 0;
                return (
                  <div
                    key={metric.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333',
                        width: '140px',
                      }}
                    >
                      {metric.label}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: '12px',
                        background: '#e5e7eb',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: `${value}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                          borderRadius: '6px',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333',
                        width: '40px',
                        textAlign: 'right',
                      }}
                    >
                      {Math.round(value)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            {summaryText && (
              <div
                style={{
                  fontSize: '18px',
                  color: '#555',
                  marginBottom: '16px',
                  lineHeight: '1.5',
                }}
              >
                {summaryText}
              </div>
            )}

            {/* Roast/Compliment */}
            {(flavorRoast || roastText) && (
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#f59e0b',
                  marginBottom: '16px',
                  lineHeight: '1.4',
                }}
              >
                {flavorRoast || roastText}
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb',
                fontSize: '14px',
                color: '#999',
              }}
            >
              <div>parel.app</div>
              <div>
                {new Date(request.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 600,
      }
    );
  } catch (error: any) {
    logger.error('[ShareCard] Failed to generate share card', { error });
    return new Response('Failed to generate share card', { status: 500 });
  }
}

