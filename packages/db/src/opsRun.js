const COUNTS_KEYS = ['scanned', 'created', 'updated', 'skipped', 'failed', 'warnings'];
function normalizeCounts(c) {
    const out = {};
    for (const k of COUNTS_KEYS) {
        out[k] = typeof c?.[k] === 'number' ? c[k] : 0;
    }
    return out;
}
const WARNINGS_CAP = 20;
const ERROR_STACK_CAP = 4000;
export async function createOpsRun(prisma, type, triggeredBy, opts) {
    return prisma.opsRun.create({
        data: {
            type,
            status: 'running',
            triggeredBy: triggeredBy ?? 'manual',
            entityType: opts?.entityType ?? undefined,
            entityId: opts?.entityId ?? undefined,
            entityLabel: opts?.entityLabel ?? undefined,
            params: opts?.params ?? undefined,
        },
    });
}
export async function finishOpsRun(prisma, id, status, opts) {
    const run = await prisma.opsRun.findUnique({ where: { id } });
    if (!run)
        return null;
    const finishedAt = new Date();
    const durationMs = Math.round(finishedAt.getTime() - run.startedAt.getTime());
    const counts = normalizeCounts(opts?.counts);
    const warningsArr = Array.isArray(opts?.warnings) ? opts.warnings.slice(0, WARNINGS_CAP) : undefined;
    const errorStack = opts?.errorStack != null
        ? String(opts.errorStack).slice(0, ERROR_STACK_CAP)
        : undefined;
    return prisma.opsRun.update({
        where: { id },
        data: {
            status,
            finishedAt,
            durationMs,
            counts,
            message: opts?.message ?? undefined,
            reportPath: opts?.reportPath ?? undefined,
            warnings: warningsArr,
            errorStack,
        },
    });
}
