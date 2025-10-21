'use client';
import React, { useEffect, useState } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Footer() {
  const [version, setVersion] = useState<string>('Loading...');
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchVersion = () => {
    const timestamp = Date.now();
    setLastFetch(timestamp);
    console.log('Footer: Fetching version...', { timestamp, refreshKey });
    
    // Try changelog first as it's more reliable - with aggressive cache busting
    const random = Math.random().toString(36).substring(7);
    fetch(`/api/changelog?t=${timestamp}&v=5&r=${random}&bust=${Math.random()}&key=${refreshKey}`)
      .then(res => {
        console.log('Footer: Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Footer: Changelog response:', data);
        if (data.success && data.entries?.length) {
          // Since we fixed the order, the first entry should be the latest released version
          const latestVersion = data.entries[0];
          console.log('Footer: First entry:', latestVersion);
          if (latestVersion && latestVersion.version.toLowerCase() !== 'unreleased') {
            console.log('Footer: Setting version to:', latestVersion.version);
            setVersion(latestVersion.version);
          } else {
            // If first entry is unreleased, find the first released version
            const releasedVersion = data.entries.find(entry => 
              entry.version.toLowerCase() !== 'unreleased'
            );
            console.log('Footer: Found released version:', releasedVersion);
            if (releasedVersion) {
              setVersion(releasedVersion.version);
            } else {
              setVersion('0.12.8d');
            }
          }
        } else {
          console.log('Footer: No entries, using fallback');
          setVersion('0.12.8d');
        }
      })
      .catch((error) => {
        console.error('Footer: Changelog API error:', error);
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

  return (
    <footer className="bg-card border-t border-border text-center py-2 text-sm text-subtle" key={`${version}-${refreshKey}-${lastFetch}`}>
      Version: {version || 'N/A'}
      {process.env.NODE_ENV === 'development' && (
        <span className="ml-2">
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="text-xs text-accent hover:underline"
            title="Refresh version"
          >
            🔄
          </button>
          <span className="ml-1 text-xs text-muted">
            (key: {refreshKey}, fetch: {lastFetch})
          </span>
        </span>
      )}
    </footer>
  );
}
