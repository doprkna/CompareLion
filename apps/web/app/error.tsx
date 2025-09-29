"use client";
import React, { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="p-4">
        <h1 className="text-2xl font-bold text-red-600">Something went wrong!</h1>
        <pre className="mt-2 text-sm text-gray-800">{error.message}</pre>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => reset()}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
