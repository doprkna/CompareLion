import React from 'react';
import { getEnvStamp } from '@/lib/env';

export default function EnvStamp() {
  const stamp = getEnvStamp();
  const isProd = stamp === 'PROD';
  return (
    <div
      className={`fixed top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded transition-opacity duration-200 opacity-50 hover:opacity-100 cursor-default ${
        isProd ? 'bg-red-600' : 'bg-green-600'
      }`}
    >
      {stamp}
    </div>
  );
}
