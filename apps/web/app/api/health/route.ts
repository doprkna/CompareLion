/**
 * Health Check Endpoint
 * Lightweight edge runtime check for deployment status
 * v0.35.16d - Vercel production stability
 */

export const runtime = 'edge';

export async function GET() {
  return Response.json({
    ok: true,
    status: 'healthy',
    version: process.env.APP_VERSION || '0.35.16d',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
}
