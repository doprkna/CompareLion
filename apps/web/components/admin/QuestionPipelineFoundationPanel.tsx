'use client';

import Link from 'next/link';

const FOUNDATION_ITEMS: { label: string; value: string }[] = [
  { label: 'Source of truth', value: 'Question' },
  { label: 'Runtime projection', value: 'FlowQuestion' },
  { label: 'Import', value: 'ready' },
  { label: 'Publish', value: 'ready' },
  { label: 'Sync', value: 'ready' },
  { label: 'Archive', value: 'ready' },
  { label: 'Options', value: 'Yes/No + custom pipe-separated options' },
  { label: 'Stats', value: 'usage / answers / reports' },
  { label: 'Reports', value: 'canonical FlowQuestion reports + admin review' },
  { label: 'Audit', value: 'QuestionPipelineRun' },
  { label: 'Validation', value: 'pnpm validate:questions' },
];

const KNOWN_LIMITS = [
  'XLSX not supported; export CSV',
  'MULTI_CHOICE UX limited',
  'Typecheck excluded due to pre-existing repo errors',
  'CI workflow manual only (workflow_dispatch)',
  'CI DB differs from dev Neon',
  'Generic POST /api/report remains separate',
];

const NEXT_ACTIONS = [
  'Import first real CSV batch (pnpm db:questions:import --file=...)',
  'Publish 10 questions and sync (pnpm db:questions:publish --source=... --limit=10 --sync)',
  'Review /admin/question-reports after testing',
];

type Props = {
  /** Smaller layout for dashboard embed */
  compact?: boolean;
  showNavLinks?: boolean;
};

export function QuestionPipelineFoundationPanel({
  compact = false,
  showNavLinks = true,
}: Props) {
  return (
    <div className={`space-y-4 ${compact ? 'text-xs' : 'text-sm'}`}>
      <section className="border border-border rounded-lg p-3 bg-bg/40 space-y-2">
        <h3 className="font-semibold text-text">Foundation status</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          {FOUNDATION_ITEMS.map((item) => (
            <div key={item.label} className="flex gap-2 min-w-0">
              <dt className="text-subtle shrink-0">{item.label}:</dt>
              <dd className="text-text truncate" title={item.value}>
                {item.value === 'ready' ? (
                  <span className="text-green-400">ready</span>
                ) : item.label === 'Validation' ? (
                  <code className="font-mono text-[11px]">{item.value}</code>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border border-border rounded-lg p-3 bg-bg/40 space-y-2">
        <h3 className="font-semibold text-text">Known limits</h3>
        <ul className="text-subtle list-disc pl-4 space-y-0.5">
          {KNOWN_LIMITS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="border border-border rounded-lg p-3 bg-bg/40 space-y-2">
        <h3 className="font-semibold text-text">Next safe actions</h3>
        <ol className="text-subtle list-decimal pl-4 space-y-1">
          {NEXT_ACTIONS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </section>

      {showNavLinks ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/admin/question-pipeline"
            className="text-xs text-accent hover:underline"
          >
            Pipeline hub &amp; runs
          </Link>
          <span className="text-subtle text-xs">·</span>
          <Link
            href="/admin/question-reports"
            className="text-xs text-accent hover:underline"
          >
            Question reports
          </Link>
          <span className="text-subtle text-xs">·</span>
          <Link href="/admin" className="text-xs text-accent hover:underline">
            Admin dashboard
          </Link>
        </div>
      ) : null}
    </div>
  );
}
