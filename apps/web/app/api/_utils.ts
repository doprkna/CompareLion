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
