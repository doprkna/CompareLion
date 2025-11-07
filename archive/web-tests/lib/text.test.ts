import { describe, it, expect } from 'vitest';
import { normalizeQuestionText } from '@/lib/text';

describe('text.ts → normalizeQuestionText()', () => {
  it('should trim whitespace from start and end', () => {
    expect(normalizeQuestionText('  hello  ')).toBe('hello');
    expect(normalizeQuestionText('\t\nworld\t\n')).toBe('world');
  });

  it('should collapse multiple spaces into single space', () => {
    expect(normalizeQuestionText('hello    world')).toBe('hello world');
    expect(normalizeQuestionText('a  b  c  d')).toBe('a b c d');
  });

  it('should remove trailing punctuation', () => {
    expect(normalizeQuestionText('hello?')).toBe('hello');
    expect(normalizeQuestionText('world!')).toBe('world');
    expect(normalizeQuestionText('test.')).toBe('test');
    expect(normalizeQuestionText('question…')).toBe('question');
    expect(normalizeQuestionText('multi???')).toBe('multi');
  });

  it('should convert to lowercase', () => {
    expect(normalizeQuestionText('HELLO')).toBe('hello');
    expect(normalizeQuestionText('WoRlD')).toBe('world');
  });

  it('should handle combined transformations', () => {
    expect(normalizeQuestionText('  What is   your NAME?  ')).toBe('what is your name');
    expect(normalizeQuestionText('Multiple    spaces   and   CAPS!!!')).toBe('multiple spaces and caps');
  });

  it('should handle empty and whitespace-only strings', () => {
    expect(normalizeQuestionText('')).toBe('');
    expect(normalizeQuestionText('   ')).toBe('');
    expect(normalizeQuestionText('\t\n')).toBe('');
  });

  it('should preserve punctuation in middle of text', () => {
    expect(normalizeQuestionText("What's your name")).toBe("what's your name");
    expect(normalizeQuestionText("isn't it")).toBe("isn't it");
  });

  it('should handle unicode characters', () => {
    expect(normalizeQuestionText('Café…')).toBe('café');
    // Full-width question mark (？) is different from ASCII ?
    // The regex only handles ASCII punctuation, so full-width stays
    expect(normalizeQuestionText('你好？')).toBe('你好？');
  });
});

