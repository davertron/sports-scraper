import { stringGap, strokeWidth } from '../constants';

export const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

export function getNote(fret: number, string: string): string {
  const startingNote = notes.indexOf(string.toUpperCase());
  return notes[(startingNote + fret) % notes.length];
}

type String = 'E' | 'A' | 'D' | 'G' | 'B' | 'e';

export function getStringY(string: String): number {
  return {
    E: 5 * stringGap - strokeWidth / 2,
    A: 4 * stringGap,
    D: 3 * stringGap,
    G: 2 * stringGap,
    B: stringGap,
    e: strokeWidth / 2,
  }[string];
} 