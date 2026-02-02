export function trackEvent(name: string, payload?: Record<string, unknown>): void {
  // No-op implementation
}

/** Flow event logging (no-op). */
export async function logFlowEvent(
  _event: string,
  _userId: string,
  _payload?: Record<string, unknown>
): Promise<void> {}
