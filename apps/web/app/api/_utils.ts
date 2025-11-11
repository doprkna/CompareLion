import jwt from 'jsonwebtoken';
import { prisma } from '@parel/db/src/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function getUserFromRequest(request: Request): Promise<{ userId: string; email: string } | null> {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  const match = cookie.match(/token=([^;]+)/);
  if (!match) return null;
  const token = match[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    // Update lastActiveAt
    await prisma.user.update({ where: { id: decoded.userId }, data: { lastActiveAt: new Date() } });
    return decoded;
  } catch {
    return null;
  }
}

/**
 * API Response Helpers (v0.35.16d - Build safety exports)
 */
export const successResponse = (data: any) =>
  Response.json({ success: true, data });

export const unauthorizedError = (msg = 'Unauthorized') =>
  new Response(msg, { status: 401 });

export const validationError = (msg = 'Validation failed') =>
  new Response(msg, { status: 400 });