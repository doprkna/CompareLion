import { describe, it, expect } from 'vitest';
import { ensureUnifiedConfigInitialized, getUiConfig } from '@parel/core/config/unified';

describe('ensureUnifiedConfigInitialized', () => {
  it('returns config without throwing', () => {
    const config = ensureUnifiedConfigInitialized();
    expect(config).toBeDefined();
    expect(config.getConfig).toBeDefined();
    expect(typeof config.getConfig).toBe('function');
  });

  it('is idempotent: multiple calls return same instance', () => {
    const a = ensureUnifiedConfigInitialized();
    const b = ensureUnifiedConfigInitialized();
    expect(a).toBe(b);
  });

  it('getUiConfig works after ensure', () => {
    ensureUnifiedConfigInitialized();
    const ui = getUiConfig();
    expect(ui).toBeDefined();
    expect(ui.toast).toBeDefined();
  });
});
