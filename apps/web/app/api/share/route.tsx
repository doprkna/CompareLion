/**
 * Social Share OG Image Generator
 * Generates Open Graph images for sharing user stats
 * v0.13.2n - Community Growth
 */

import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

/**
 * GET /api/share?xp=1000&level=5&streak=7&name=Player
 * Generates OG image with user stats
 */
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    const mode = searchParams.get('mode') || 'stats'; // 'stats' or 'press'
    const xp = searchParams.get('xp') || '0';
    const level = searchParams.get('level') || '1';
    const streak = searchParams.get('streak') || '0';
    const name = searchParams.get('name') || 'Player';
    const rank = searchParams.get('rank') || 'N/A';

    // Press Mode - Clean branded card for media/press
    if (mode === 'press') {
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
              fontFamily: 'sans-serif',
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '32px',
                padding: '80px 120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Logo */}
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '40px',
                }}
              >
                <div style={{ fontSize: 64 }}>✨</div>
              </div>

              {/* Brand Name */}
              <div
                style={{
                  fontSize: 96,
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  marginBottom: '32px',
                }}
              >
                PareL
              </div>

              {/* Tagline */}
              <div
                style={{
                  fontSize: 36,
                  color: '#666',
                  textAlign: 'center',
                  maxWidth: '800px',
                  lineHeight: '1.4',
                }}
              >
                Compare yourself. Discover insights. Level up.
              </div>

              {/* CTA */}
              <div
                style={{
                  marginTop: '48px',
                  fontSize: 28,
                  color: '#999',
                }}
              >
                parel.app
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

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
            padding: '60px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Main Content */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '32px',
              padding: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              width: '90%',
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: '24px',
              }}
            >
              PareL Stats
            </div>

            {/* Player Name */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#333',
                marginBottom: '48px',
              }}
            >
              {name}
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: 'flex',
                gap: '48px',
                marginBottom: '24px',
              }}
            >
              {/* XP */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '24px',
                  padding: '32px',
                  minWidth: '200px',
                }}
              >
                <div style={{ fontSize: 64, marginBottom: '8px' }}>💫</div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: 'white',
                  }}
                >
                  {parseInt(xp).toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  XP
                </div>
              </div>

              {/* Level */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: '24px',
                  padding: '32px',
                  minWidth: '200px',
                }}
              >
                <div style={{ fontSize: 64, marginBottom: '8px' }}>⭐</div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: 'white',
                  }}
                >
                  {level}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  Level
                </div>
              </div>

              {/* Streak */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  borderRadius: '24px',
                  padding: '32px',
                  minWidth: '200px',
                }}
              >
                <div style={{ fontSize: 64, marginBottom: '8px' }}>🔥</div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: 'white',
                  }}
                >
                  {streak}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  Day Streak
                </div>
              </div>
            </div>

            {/* Rank */}
            {rank !== 'N/A' && (
              <div
                style={{
                  fontSize: 32,
                  color: '#666',
                  marginTop: '24px',
                }}
              >
                🏆 Ranked #{rank}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '32px',
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 600,
            }}
          >
            Join me on PareL! 🎮
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    // Image generation error - return error response
    logger.error('Share image generation error', e);
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    });
  }
};

