import type { NextRequest } from 'next/server';

export function getAuthedUser(req: NextRequest) {
  // Read from middleware headers if present
  const id = req.headers.get('x-user-id') || process.env.DEFAULT_USER_ID || 'test-user';
  const tenantId = req.headers.get('x-tenant-id') || process.env.DEFAULT_TENANT_ID || 'test-tenant';
  return { id, tenantId };
}
