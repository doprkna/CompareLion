/**
 * Placeholder Page Component
 * v0.35.12 - Generic placeholder for unfinished/empty modules
 */

"use client";

export default function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-3xl font-bold mb-2">{name}</h1>
      <p className="text-muted-foreground">
        This module exists but has no data or UI yet.
      </p>
    </div>
  );
}
