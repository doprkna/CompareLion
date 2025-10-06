import { NextResponse } from 'next/server';
import { getLatestVersion } from '@/lib/services/versionService';
import { toVersionDTO, VersionDTO } from '@/lib/dto/versionDTO';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, version: 'dev' });
  }

  try {
    const v = await getLatestVersion();
    if (!v) {
      // Fallback to parsing changelog directly to avoid circular dependency during build
      try {
        const fs = require('fs');
        const path = require('path');
        
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
            return NextResponse.json({ 
              success: true, 
              version: { 
                number: versionMatch[1],
                releasedAt: versionMatch[2] || new Date().toISOString()
              }
            });
          }
        }
      } catch (changelogError) {
        console.error('Error parsing changelog fallback:', changelogError);
      }
      return NextResponse.json({ success: true, version: null });
    }
    const version: VersionDTO = toVersionDTO(v);
    return NextResponse.json({ success: true, version });
  } catch (error) {
    console.error('Error fetching version:', error);
    return NextResponse.json({ success: true, version: 'dev' });
  }
}
