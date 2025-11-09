'use client';
import React, { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Footer() {
  const [version, setVersion] = useState<string>('Loading...');
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchVersion = () => {
    const timestamp = Date.now();
    setLastFetch(timestamp);
    
    // Try changelog first as it's more reliable - with aggressive cache busting
    const random = Math.random().toString(36).substring(7);
    fetch(`/api/changelog?t=${timestamp}&v=5&r=${random}&bust=${Math.random()}&key=${refreshKey}`)
      .then(res => {
        return res.json();
      })
      .then(data => {
        if (data.success && data.entries?.length) {
          // Since we fixed the order, the first entry should be the latest released version
          const latestVersion = data.entries[0];
          if (latestVersion && latestVersion.version.toLowerCase() !== 'unreleased') {
            setVersion(latestVersion.version);
          } else {
            // If first entry is unreleased, find the first released version
            const releasedVersion = data.entries.find(entry => 
              entry.version.toLowerCase() !== 'unreleased'
            );
            if (releasedVersion) {
              setVersion(releasedVersion.version);
            } else {
              setVersion('0.12.8d');
            }
          }
        } else {
          setVersion('0.12.8d');
        }
      })
      .catch((error) => {
        logger.error('Footer: Changelog API error', error);
        // Fallback to version API if changelog fails
        fetch(`/api/version?t=${timestamp}&r=${random}&key=${refreshKey}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.version) {
              setVersion(data.version.number || data.version);
            } else {
              setVersion('0.12.8d');
            }
          })
          .catch(() => {
            // Final fallback to package.json version
            setVersion('0.12.8d');
          });
      });
  };

  useEffect(() => {
    fetchVersion();
  }, [refreshKey]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <footer 
      className="fixed bottom-0 left-0 px-3 py-1.5 text-xs bg-white/90 text-blue-600 backdrop-blur-sm hover:opacity-80 transition-opacity z-50"
      key={`${version}-${refreshKey}-${lastFetch}`}
    >
      <span className="font-medium">
        Version: {version || 'N/A'}
        {isDev && (
          <>
            <span className="mx-1.5">–</span>
            <span className="text-blue-500">DEV MODE (check console)</span>
          </>
        )}
      </span>
      {isDev && (
        <button 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="ml-2 text-blue-400 hover:text-blue-600 transition-colors"
          title="Refresh version"
        >
          🔄
        </button>
      )}
    </footer>
  );
}
