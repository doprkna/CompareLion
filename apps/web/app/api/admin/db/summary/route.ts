/**
 * Admin DB Summary API
 * 
 * GET /api/admin/db/summary
 * Returns the latest database integrity check summary
 * v0.30.2 - Database Integrity Sweep
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse, notFoundError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/admin/db/summary
 * Get latest integrity check summary
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const auth = await requireAdmin(req);
  if (!auth.success || !auth.user) {
    return unauthorizedError('Admin required');
  }

  try {
    // Try to find latest integrity report from logs directory
    const logsDir = join(process.cwd(), 'logs');
    
    try {
      const files = await readdir(logsDir);
      const integrityFiles = files
        .filter(f => f.startsWith('db-integrity-') && f.endsWith('.json'))
        .sort()
        .reverse(); // Latest first
      
      if (integrityFiles.length === 0) {
        return successResponse({
          available: false,
          message: 'No integrity reports found. Run: pnpm tsx scripts/db-integrity-check.ts --save',
        });
      }
      
      // Read latest file
      const latestFile = integrityFiles[0];
      const filepath = join(logsDir, latestFile);
      const content = await readFile(filepath, 'utf-8');
      let summary; // sanity-fix
      try { // sanity-fix
        summary = JSON.parse(content); // sanity-fix
      } catch { // sanity-fix
        return successResponse({ available: false, message: 'Invalid JSON in integrity file' }); // sanity-fix
      } // sanity-fix
      
      return successResponse({
        available: true,
        filename: latestFile,
        timestamp: summary.timestamp,
        summary: {
          totalModels: summary.totalModels,
          modelsWithRecords: summary.modelsWithRecords,
          emptyModels: summary.emptyModels,
          modelsWithNullViolations: summary.modelsWithNullViolations,
          modelsWithFkBroken: summary.modelsWithFkBroken,
        },
        // Include sample results (first 10 models)
        sampleResults: (summary.results || []).slice(0, 10), // sanity-fix
        totalResults: summary.results?.length || 0, // sanity-fix
      });
    } catch (dirError) {
      // Logs directory might not exist
      return successResponse({
        available: false,
        message: 'Logs directory not found. Run integrity check first.',
      });
    }
  } catch (error) {
    return successResponse({
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});