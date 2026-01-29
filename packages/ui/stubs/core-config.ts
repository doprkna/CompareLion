/**
 * Build-time stub for @parel/core/config so packages/ui compiles without
 * pulling in packages/core source (avoids TS6059/TS6307).
 * At runtime, apps/web resolves @parel/core to the real package.
 */

export interface UiConfigStub {
  toast: { tooltipDelay: number };
}

const defaultUiConfig: UiConfigStub = { toast: { tooltipDelay: 300 } };

export function getUiConfig(): Readonly<UiConfigStub> {
  return defaultUiConfig;
}
