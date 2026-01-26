/**
 * Parel Story Generator - PNG Export API 2.0
 * Generate PNG grid from story panels (supports 1-8 panels, vertical/grid layouts)
 * v0.40.2 - Parel Stories 2.0 (Extended Stories)
 */

import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { logger } from '@/lib/logger';
import { LayoutMode } from '@parel/story/storyService';

export const runtime = 'nodejs';

/**
 * GET /api/story/export?panels=JSON&layoutMode=vertical|grid&title=...&logline=...
 * Generate PNG story grid
 * Query params: panels (JSON), layoutMode (optional, default: grid), title (optional), logline (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const panelsParam = searchParams.get('panels');
    const layoutMode = (searchParams.get('layoutMode') || 'grid') as LayoutMode;
    const title = searchParams.get('title');
    const logline = searchParams.get('logline');

    let panels: Array<{
      imageUrl: string;
      caption: string;
      vibeTag: string;
      microStory: string;
      role?: string;
    }> = [];

    if (panelsParam) {
      // Parse panels from query param
      try {
        panels = JSON.parse(decodeURIComponent(panelsParam));
      } catch (error) {
        return new Response('Invalid panels parameter', { status: 400 });
      }
    } else {
      return new Response('panels parameter required', { status: 400 });
    }

    if (panels.length === 0 || panels.length > 8) {
      return new Response('Need 1-8 panels', { status: 400 });
    }

    const numPanels = panels.length;
    const isVertical = layoutMode === 'vertical';
    const isGrid = layoutMode === 'grid';

    // Calculate dimensions based on layout
    let panelWidth: number;
    let panelHeight: number;
    let cardWidth: number;
    let cardHeight: number;
    const padding = 20;
    const gap = 20;

    if (isVertical) {
      // Vertical layout: panels stacked
      panelWidth = 500;
      panelHeight = 400;
      cardWidth = panelWidth + padding * 2 + 80;
      cardHeight = numPanels * panelHeight + (numPanels - 1) * gap + padding * 2 + (title ? 120 : 80);
    } else {
      // Grid layout: 2 columns
      const cols = 2;
      const rows = Math.ceil(numPanels / cols);
      panelWidth = 350;
      panelHeight = 400;
      cardWidth = cols * panelWidth + (cols + 1) * gap + padding * 2 + 80;
      cardHeight = rows * panelHeight + (rows - 1) * gap + padding * 2 + (title ? 120 : 80);
    }

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
              padding: `${padding}px`,
              display: 'flex',
              flexDirection: 'column',
              width: `${cardWidth - 80}px`,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
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
                {title || 'Parel Story'}
              </div>
              {logline && (
                <div
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4',
                  }}
                >
                  {logline}
                </div>
              )}
            </div>

            {/* Panels Container */}
            <div
              style={{
                display: isGrid ? 'grid' : 'flex',
                gridTemplateColumns: isGrid ? 'repeat(2, 1fr)' : undefined,
                flexDirection: isVertical ? 'column' : undefined,
                gap: `${gap}px`,
                width: '100%',
              }}
            >
              {panels.map((panel, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: `${panelWidth}px`,
                    gap: '12px',
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      width: `${panelWidth}px`,
                      height: `${panelHeight - 120}px`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={panel.imageUrl}
                      alt={`Panel ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>

                  {/* Role Badge (if extended story) */}
                  {panel.role && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          padding: '2px 8px',
                          background: '#e5e7eb',
                          color: '#666',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        {panel.role}
                      </div>
                    </div>
                  )}

                  {/* Caption */}
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#333',
                      textAlign: 'center',
                    }}
                  >
                    {panel.caption}
                  </div>

                  {/* Vibe Tag Badge */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 12px',
                        background: '#667eea',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      {panel.vibeTag}
                    </div>
                  </div>

                  {/* Micro Story */}
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#666',
                      textAlign: 'center',
                      lineHeight: '1.4',
                    }}
                  >
                    {panel.microStory}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      {
        width: cardWidth,
        height: cardHeight,
      }
    );
  } catch (error: any) {
    logger.error('[Story] Failed to generate story export', { error });
    return new Response('Failed to generate story export', { status: 500 });
  }
}

