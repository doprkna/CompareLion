/**
 * AURE Interaction Engine - Mix Collage API
 * Generate PNG collage from multiple rating requests
 * v0.39.8 - Mix Mode 2.0 (Multi-Image Vibe Story)
 */

import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { getMixImageUrls } from '@/lib/aure/interaction/mixmodeService';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * GET /api/aure/interaction/mix/collage?requestIds=id1,id2,id3
 * Generate PNG collage from request IDs
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const collageId = searchParams.get('collageId');
    const requestIdsParam = searchParams.get('requestIds'); // Fallback for direct requestIds

    let requestIds: string[] = [];

    if (collageId) {
      // Look up MixSession to get requestIds
      try {
        const session = await prisma.mixSession.findUnique({
          where: { id: collageId },
          select: { requestIds: true },
        });

        if (!session) {
          return new Response('Collage not found', { status: 404 });
        }

        // Parse requestIds from JSON field
        const ids = typeof session.requestIds === 'string' 
          ? JSON.parse(session.requestIds) 
          : session.requestIds;
        
        requestIds = Array.isArray(ids) ? ids : [];
      } catch (error) {
        logger.error('[AURE Interaction] Failed to load mix session', { error, collageId });
        return new Response('Failed to load collage', { status: 500 });
      }
    } else if (requestIdsParam) {
      // Fallback: use requestIds directly
      requestIds = requestIdsParam.split(',').map((id) => id.trim()).filter(Boolean);
    } else {
      return new Response('collageId or requestIds query parameter is required', { status: 400 });
    }

    if (requestIds.length < 2 || requestIds.length > 6) {
      return new Response('Need 2-6 request IDs', { status: 400 });
    }

    // Get image URLs
    const imageUrls = await getMixImageUrls(requestIds);

    if (imageUrls.length === 0) {
      return new Response('No images found for these requests', { status: 404 });
    }

    // Generate collage based on number of images
    const gridCols = imageUrls.length <= 2 ? 2 : imageUrls.length <= 4 ? 2 : 3;
    const gridRows = Math.ceil(imageUrls.length / gridCols);
    const imageSize = 300;
    const padding = 20;
    const cardWidth = gridCols * imageSize + (gridCols + 1) * padding + 80;
    const cardHeight = gridRows * imageSize + (gridRows + 1) * padding + 200;

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
              width: `${cardWidth}px`,
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
                Parel Mix
              </div>
            </div>

            {/* Image Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gap: `${padding}px`,
                width: '100%',
              }}
            >
              {imageUrls.map((imageUrl, index) => (
                <div
                  key={index}
                  style={{
                    width: `${imageSize}px`,
                    height: `${imageSize}px`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`Mix item ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      {
        width: cardWidth + 80,
        height: cardHeight,
      }
    );
  } catch (error: any) {
    logger.error('[AURE Interaction] Failed to generate mix collage', { error });
    return new Response('Failed to generate collage', { status: 500 });
  }
}

