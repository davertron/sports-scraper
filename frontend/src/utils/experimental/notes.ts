import { Note } from './queryExecutor';

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