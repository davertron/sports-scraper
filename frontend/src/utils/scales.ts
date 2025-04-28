import { notes } from './notes';

export function getKey(note: string): string[] {
  const key = [];
  const root = notes.indexOf(note.toUpperCase());
  const intervals = [0, 2, 4, 5, 7, 9, 11]; // Distance from root; Jump with 2, 2, 1, 2, 2, 2, 1
  for (let i = 0; i < intervals.length; i++) {
    key.push(notes[(root + intervals[i]) % notes.length]);
  }
  return key;
}

export function getScaleDegrees(note: string, scaleType: 'major' | 'minor') {
  const root = notes.indexOf(note.toUpperCase());
  const intervals = scaleType === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  return intervals.map((interval, index) => ({
    note: notes[(root + interval) % notes.length],
    degree: index + 1
  }));
} 