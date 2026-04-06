import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('passes a minimal assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
