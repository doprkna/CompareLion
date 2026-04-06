import { describe, it, expect } from 'vitest';
import { generateSigilHeatmap } from '@parel/core/sigils/heatmap';

describe('generateSigilHeatmap (import regression)', () => {
  it('export is a function', () => {
    expect(typeof generateSigilHeatmap).toBe('function');
  });

  it('returns { svg: string } for valid input', () => {
    const buckets = Array(56).fill(1);
    const result = generateSigilHeatmap({ buckets, seed: 'test' });
    expect(result).toHaveProperty('svg');
    expect(typeof result.svg).toBe('string');
    expect(result.svg).toContain('<svg');
  });
});
