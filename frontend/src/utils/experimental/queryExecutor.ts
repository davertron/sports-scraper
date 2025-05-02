
import { QueryStep } from './queryParser';
import { getKey } from '../scales';

// Dummy types
export type Note = {
  note: string;
  fret: number;
  string: string;
  color: string | null;
};

export function executeQuery(notes: Note[], steps: QueryStep[]): Note[] {
  let result = notes;

  for (const step of steps) {
    const handler = handlers[step.type];
    if (!handler) {
      throw new Error(`Unknown filter: ${step.type}`);
    }
    result = handler(result, step.args);
  }

  return result;
}

// Map step types to real functions
const handlers: Record<string, (notes: Note[], args: string[]) => Note[]> = {
  keyOf,
  onFrets,
  onStrings,
  not,
  color,
};

// Example implementations

function keyOf(notes: Note[], args: string[]): Note[] {
  const rootNote = args[0];
  const allowedNotes = majorScaleNotes(rootNote); // ['C', 'D', 'E', 'F', 'G', 'A', 'B'] etc.
  return notes.filter(n => allowedNotes.includes(n.note));
}

function onFrets(notes: Note[], args: string[]): Note[] {
  const frets = args.map(a => parseInt(a, 10));
  return notes.filter(n => frets.includes(n.fret));
}

function onStrings(notes: Note[], args: string[]): Note[] {
  return notes.filter(n => args.includes(n.string));
}

function not(notes: Note[], args: string[]): Note[] {
  // args[0] is a function name, args.slice(1) are its arguments
  const funcName = args[0];
  const funcArgs = args.slice(1);

  const innerHandler = handlers[funcName];
  if (!innerHandler) {
    throw new Error(`Unknown function in not(): ${funcName}`);
  }

  const matchingNotes = new Set(innerHandler(notes, funcArgs).map(n => n));

  return notes.filter(n => !matchingNotes.has(n));
}

function color(notes: Note[], args: string[]): Note[] {
  const note = args[0];
  const color = args[1];
  return notes.map(n => n.note === note || note === '*' ? { ...n, color } : n);
}

// Helper to simulate major scales
function majorScaleNotes(root: string): string[] {
  return getKey(root);
}
