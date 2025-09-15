'use client';
import React, { useEffect, useState } from 'react';

export default function Footer() {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    fetch('/api/version')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.version) setVersion(data.version.name);
      });
  }, []);

  return (
    <footer className="bg-gray-100 text-center py-2 text-sm text-gray-600">
      Version: {version || 'N/A'}
    </footer>
  );
}
