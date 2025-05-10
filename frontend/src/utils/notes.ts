import { stringGap, strokeWidth } from '../constants';

export type Note = {
  note: string;
  fret: number;
  string: string;
  color: string | null;
};

export enum GuitarString {
  E = 'E',
  A = 'A',
  D = 'D',
  G = 'G',
  B = 'B',
  e = 'e'
}

export function getStringY(string: GuitarString): number {
  return {
    [GuitarString.E]: 5 * stringGap - strokeWidth / 2,
    [GuitarString.A]: 4 * stringGap,
    [GuitarString.D]: 3 * stringGap,
    [GuitarString.G]: 2 * stringGap,
    [GuitarString.B]: stringGap,
    [GuitarString.e]: strokeWidth / 2,
  }[string];
} 

const STRINGS = ['E', 'A', 'D', 'G', 'B', 'e'];
const NOTE_ORDER = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

export function generateNotes(numberOfFrets: number): Note[] {
  const notes: Note[] = [];
  for (const string of STRINGS) {
    for (let fret = 0; fret <= numberOfFrets; fret++) {
      const startingNote = NOTE_ORDER.indexOf(string.toUpperCase());
      const note = NOTE_ORDER[(startingNote + fret) % NOTE_ORDER.length];
      notes.push({ note, fret, string, color: null });
    }
  }
  return notes;
}

export function getKey(note: string): string[] {
  const key = [];
  const root = NOTE_ORDER.indexOf(note.toUpperCase());
  const intervals = [0, 2, 4, 5, 7, 9, 11]; // Distance from root; Jump with 2, 2, 1, 2, 2, 2, 1
  for (let i = 0; i < intervals.length; i++) {
    key.push(NOTE_ORDER[(root + intervals[i]) % NOTE_ORDER.length]);
  }
  return key;
}

export function getScaleDegrees(note: string, scaleType: 'major' | 'minor') {
  const root = NOTE_ORDER.indexOf(note.toUpperCase());
  const intervals = scaleType === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  return intervals.map((interval, index) => ({
    note: NOTE_ORDER[(root + interval) % NOTE_ORDER.length],
    degree: index + 1
  }));
} 