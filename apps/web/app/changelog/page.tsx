"use client";
import { useEffect, useState } from "react";
import { ChangelogSkeleton } from "@/components/LoadingSkeletons";

export default function ChangelogPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/changelog")
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []))
      .catch(() => setError("Failed to load changelog"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ChangelogSkeleton />;
  }

  if (error) {
    return <div className="text-red-600 font-medium p-4">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Lock indicator in dev mode */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mb-4 text-xs text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <span>🔒</span>
            <span className="font-semibold">Changelog Protection Active</span>
          </div>
          <p className="mt-1 text-yellow-600 dark:text-yellow-500">
            Historical entries are locked and cannot be edited automatically.
            Only new versions can be prepended.
          </p>
        </div>
      )}
      
      {entries.map((entry, i) => (
        <details key={entry.version} open={i === 0} className="rounded-xl border p-4">
          <summary className="cursor-pointer text-lg font-semibold text-foreground">
            {entry.version === "Unreleased"
              ? "Unreleased"
              : `${entry.version} — ${entry.date ?? ""}`}
          </summary>

          <div className="mt-4 space-y-4">
            {Object.entries(entry.sections).map(([title, items]: [string, any]) => (
              <section key={title}>
                <h4 className="font-semibold mb-1 text-foreground">{title}</h4>
                <ul className="list-disc pl-6 space-y-1 text-foreground">
                  {items.map((line: string, idx: number) => (
                    <li key={idx} className="whitespace-pre-line leading-relaxed">
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
