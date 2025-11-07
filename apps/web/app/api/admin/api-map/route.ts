/**
 * Admin API Map API
 * 
 * GET /api/admin/api-map
 * Returns the latest API map summary
 * v0.30.3 - API & Schema Sanity Audit
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/admin/api-map
 * Get latest API map summary
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const auth = await requireAdmin(req);
  if (!auth.success || !auth.user) {
    return unauthorizedError('Admin required');
  }

  try {
    // Try to find latest API map from logs directory
    const logsDir = join(process.cwd(), 'logs');
    
    try {
      const files = await readdir(logsDir);
      const mapFiles = files
        .filter(f => f.startsWith('api-map-') && f.endsWith('.json'))
        .sort()
        .reverse(); // Latest first
      
      if (mapFiles.length === 0) {
        return successResponse({
          available: false,
          message: 'No API map found. Run: pnpm tsx scripts/api-map.ts',
        });
      }
      
      // Read latest file
      const latestFile = mapFiles[0];
      const filepath = join(logsDir, latestFile);
      const content = await readFile(filepath, 'utf-8');
      const apiMap = JSON.parse(content);
      
      return successResponse({
        available: true,
        filename: latestFile,
        timestamp: apiMap.timestamp,
        summary: {
          totalRoutes: apiMap.totalRoutes,
          routesByMethod: apiMap.routesByMethod,
          modelsUsed: apiMap.modelsUsed.length,
          orphanedModels: apiMap.orphanedModels.length,
          routesWithoutFe: apiMap.routesWithoutFe.length,
        },
        // Include top-level stats
        orphanedModels: apiMap.orphanedModels.slice(0, 20), // First 20
        routesWithoutFe: apiMap.routesWithoutFe.slice(0, 20), // First 20
        systems: Object.keys(apiMap.routesBySystem).map(system => ({
          system,
          count: apiMap.routesBySystem[system].length,
        })),
      });
    } catch (dirError) {
      // Logs directory might not exist
      return successResponse({
        available: false,
        message: 'Logs directory not found. Run API map script first.',
      });
    }
  } catch (error) {
    return successResponse({
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});