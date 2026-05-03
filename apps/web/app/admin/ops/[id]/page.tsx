import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminOpsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = await prisma.opsRun.findUnique({ where: { id } });
  if (!run) notFound();

  const counts = run.counts as Record<string, number> | null;
  const countsStr = counts && typeof counts === 'object'
    ? JSON.stringify(counts, null, 2)
    : String(run.counts ?? '-');
  const runParams = run.params as Record<string, unknown> | null;
  const paramsStr = runParams && typeof runParams === 'object'
    ? JSON.stringify(runParams, null, 2)
    : null;
  const warnings = run.warnings as unknown[] | null;
  const warningsList = Array.isArray(warnings) ? warnings.slice(0, 20) : [];

  const statusClass =
    run.status === 'success'
      ? 'text-green-600 dark:text-green-400'
      : run.status === 'failed'
      ? 'text-red-600 dark:text-red-400'
      : 'text-amber-600 dark:text-amber-400';

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-text">Ops Run: {run.type}</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/ops">← Back to list</Link>
        </Button>

        <div className="bg-card border-2 border-border rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-subtle">ID</span>
            <span className="font-mono text-xs break-all">{run.id}</span>
            <span className="text-subtle">Type</span>
            <span>{run.type}</span>
            <span className="text-subtle">Status</span>
            <span className={statusClass}>{run.status}</span>
            {run.entityLabel && (
              <>
                <span className="text-subtle">Entity</span>
                <span className="text-text truncate" title={run.entityLabel}>{run.entityLabel}</span>
              </>
            )}
            <span className="text-subtle">Started</span>
            <span>{new Date(run.startedAt).toLocaleString()}</span>
            <span className="text-subtle">Finished</span>
            <span>{run.finishedAt ? new Date(run.finishedAt).toLocaleString() : '-'}</span>
            <span className="text-subtle">Duration</span>
            <span>{run.durationMs != null ? `${run.durationMs}ms` : '-'}</span>
            <span className="text-subtle">Triggered by</span>
            <span>{run.triggeredBy ?? '-'}</span>
          </div>

          {paramsStr && (
            <div>
              <h3 className="text-sm font-medium text-subtle mb-1">Params</h3>
              <pre className="text-xs font-mono bg-bg rounded p-2 overflow-x-auto whitespace-pre-wrap">{paramsStr}</pre>
            </div>
          )}

          {run.message && (
            <div>
              <h3 className="text-sm font-medium text-subtle mb-1">Message</h3>
              <p className="text-text bg-bg rounded p-2">{run.message}</p>
            </div>
          )}

          {run.counts && (
            <div>
              <h3 className="text-sm font-medium text-subtle mb-1">Counts</h3>
              <pre className="text-xs font-mono bg-bg rounded p-2 overflow-x-auto">{countsStr}</pre>
            </div>
          )}

          {warningsList.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-subtle mb-1">Warnings ({warningsList.length})</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-amber-700 dark:text-amber-400 bg-bg rounded p-2">
                {warningsList.map((w, i) => (
                  <li key={i} className="font-mono text-xs">
                    {typeof w === 'object' && w !== null ? JSON.stringify(w) : String(w)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {run.errorStack && (
            <div>
              <details className="bg-bg rounded border border-border">
                <summary className="text-sm font-medium text-subtle cursor-pointer p-2 hover:bg-accent/5">
                  Error stack
                </summary>
                <pre className="text-xs font-mono p-2 overflow-x-auto whitespace-pre-wrap text-red-700 dark:text-red-400 border-t border-border">
                  {run.errorStack}
                </pre>
              </details>
            </div>
          )}

          {run.reportPath && (
            <div>
              <h3 className="text-sm font-medium text-subtle mb-1">Report path</h3>
              <p className="text-text font-mono text-xs break-all">{run.reportPath}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
