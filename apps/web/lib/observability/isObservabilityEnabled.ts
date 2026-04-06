/**
 * Gate for observability (Sentry, OpenTelemetry, Prisma instrumentation).
 * Disabled in dev by default; set DISABLE_OBSERVABILITY=false to enable in dev.
 */
export function isObservabilityEnabled(): boolean {
  return (
    process.env.DISABLE_OBSERVABILITY !== 'true' &&
    process.env.NODE_ENV === 'production'
  );
}
