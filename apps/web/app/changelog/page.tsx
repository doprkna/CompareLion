"use client";

import { useEffect, useMemo, useState } from "react";
import { ChangelogSkeleton } from "@/components/LoadingSkeletons";
import { ChangelogSummary } from "@/components/changelog/ChangelogSummary";

const TYPE_OPTIONS = ["All", "Added", "Fixed", "Changed", "Docs"] as const;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const mi = parseInt(m || "1", 10) - 1;
  return mi >= 0 && mi < 12 ? `${MONTH_NAMES[mi]} ${y}` : ym;
}

interface ChangelogEntry {
  version: string;
  date: string;
  month?: string;
  year?: number;
  counts?: { added: number; fixed: number; changed: number; docs: number };
  sections: Record<string, string[]>;
}

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetch("/api/changelog")
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []))
      .catch(() => setError("Failed to load changelog"))
      .finally(() => setLoading(false));
  }, []);

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    entries.forEach((e) => {
      if (e.month) months.add(e.month);
    });
    return Array.from(months).sort().reverse();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    return entries.filter((entry) => {
      if (selectedMonth !== "all" && entry.month !== selectedMonth) return false;
      if (selectedType !== "all") {
        const section = entry.sections?.[selectedType];
        if (!section?.length) return false;
      }
      if (q) {
        const matchVersion = entry.version?.toLowerCase().includes(q);
        let matchContent = false;
        if (entry.sections) {
          for (const items of Object.values(entry.sections)) {
            if (items?.some((s) => String(s).toLowerCase().includes(q))) {
              matchContent = true;
              break;
            }
          }
        }
        if (!matchVersion && !matchContent) return false;
      }
      return true;
    });
  }, [entries, searchText, selectedMonth, selectedType]);

  const groupedByMonth = useMemo(() => {
    const map: Record<string, ChangelogEntry[]> = {};
    filteredEntries.forEach((e) => {
      const key = e.month || "other";
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredEntries]);

  if (loading) {
    return <ChangelogSkeleton />;
  }

  if (error) {
    return <div className="text-red-600 font-medium p-4">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-bg-muted p-6 text-text">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {process.env.NODE_ENV !== "production" && (
            <div className="mb-4 text-xs text-amber-200 border border-amber-600/50 bg-amber-950/30 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <span>🔒</span>
                <span className="font-semibold">Changelog Protection Active</span>
              </div>
              <p className="mt-1 text-amber-300/90">
                Historical entries are locked and cannot be edited automatically.
                Only new versions can be prepended.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500"
            />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-text"
            >
              <option value="all">Month</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-text"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t === "All" ? "all" : t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-8">
            {groupedByMonth.length === 0 && (
              <p className="text-subtle">No entries match the current filters.</p>
            )}
            {groupedByMonth.map(([monthKey, monthEntries]) => (
              <section key={monthKey}>
                <h2 className="text-lg font-semibold text-text mb-4">
                  {monthKey === "other" ? "Other" : formatMonthLabel(monthKey)}
                </h2>
                <div className="space-y-4">
                  {monthEntries.map((entry, i) => (
                    <details
                      key={entry.version}
                      open={i === 0 && monthKey === groupedByMonth[0]?.[0]}
                      className="rounded-xl border border-border bg-card/80 p-4"
                    >
                      <summary className="cursor-pointer text-lg font-semibold text-foreground">
                        {entry.version === "Unreleased"
                          ? "Unreleased"
                          : `${entry.version} — ${entry.date ?? ""}`}
                      </summary>
                      <div className="mt-4 space-y-4">
                        {Object.entries(entry.sections || {}).map(([title, items]) => {
                          const list = Array.isArray(items) ? items.filter((s): s is string => typeof s === 'string' && s.trim().length > 0) : [];
                          return (
                            <section key={title}>
                            <h4 className="font-semibold mb-1 text-text-secondary">{title}</h4>
                            <ul className="list-disc pl-6 space-y-1 text-subtle">
                                {list.map((line, idx) => (
                                  <li key={idx} className="whitespace-pre-line leading-relaxed">
                                    {String(line).trim()}
                                  </li>
                                ))}
                              </ul>
                            </section>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="lg:w-64 shrink-0 order-first lg:order-last">
          <ChangelogSummary entries={filteredEntries} />
        </div>
      </div>
    </div>
  );
}
