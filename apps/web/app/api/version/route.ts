import { NextRequest } from 'next/server';
import { getLatestVersion } from '@/lib/services/versionService';
import { toVersionDTO, VersionDTO } from '@/lib/dto/versionDTO';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess } from '@parel/api';
import type { VersionResponseDTO } from '@parel/types/dto';
import fs from 'fs';
import path from 'path';

/**
 * Version Endpoint
 * Returns current application version
 * v0.41.2 - C3 Step 3: Unified API envelope
 * v0.41.8 - C3 Step 9: DTO Consolidation Batch #1
 */
export const GET = safeAsync(async (req: NextRequest) => {
  if (!process.env.DATABASE_URL) {
    const response: VersionResponseDTO = { version: 'dev' };
    return buildSuccess(req, response);
  }

  const v = await getLatestVersion();
  if (!v) {
    // Fallback to parsing changelog directly to avoid circular dependency during build
    try {
      // fs and path are already imported
      
      const possiblePaths = [
        path.join(process.cwd(), 'CHANGELOG.md'),
        path.join(process.cwd(), 'apps/web/CHANGELOG.md'),
        path.join(process.cwd(), '..', 'CHANGELOG.md'),
        path.join(process.cwd(), '..', '..', 'CHANGELOG.md')
      ];
      
      let content = '';
      let found = false;
      
      for (const changelogPath of possiblePaths) {
        try {
          content = fs.readFileSync(changelogPath, 'utf-8');
          found = true;
          break;
        } catch (err) {
          // Continue to next path
        }
      }
      
      if (found) {
        // Simple regex to extract the first version
        const versionMatch = content.match(/^## \[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/m);
        if (versionMatch) {
          const response: VersionResponseDTO = { 
            version: { 
              number: versionMatch[1],
              releasedAt: versionMatch[2] || new Date().toISOString()
            }
          };
          return buildSuccess(req, response);
        }
      }
    } catch (changelogError) {
      // Continue to fallback
    }
    const response: VersionResponseDTO = { version: null };
    return buildSuccess(req, response);
  }
  const version: VersionDTO = toVersionDTO(v);
  const response: VersionResponseDTO = { version };
  return buildSuccess(req, response);
});
