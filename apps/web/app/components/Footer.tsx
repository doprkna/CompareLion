'use client';
import React, { useEffect, useState } from 'react';

export default function Footer() {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    fetch('/api/changelog')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.entries?.length) {
          setVersion(data.entries[0].version);
        }
      });
  }, []);

  return (
    <footer className="bg-gray-100 text-center py-2 text-sm text-gray-600">
      Version: {version || 'N/A'}
    </footer>
  );
}
