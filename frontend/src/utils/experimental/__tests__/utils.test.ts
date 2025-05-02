import { describe, it, expect } from 'vitest';
import { generateNotes } from '../notes';

describe('generateNotes', () => {
  it('generates notes for a given number of frets', () => {
    const notes = generateNotes(12);

    expect(notes.length).toBe(12 * 6 + 6); // 12 frets * 6 strings + 6 open strings
  });
});
