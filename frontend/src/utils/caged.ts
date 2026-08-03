import { NOTE_ORDER, GuitarString } from "./notes";

export type CagedShape = "C" | "A" | "G" | "E" | "D";

// Which open string each shape's defining root note is anchored to, and the
// scale-box fret window relative to that anchor (0 = the anchor fret
// itself, i.e. where the shape's root note falls on anchorString).
//
// The anchor points are derived from the actual open-chord fingerings, not
// guessed: e.g. open C (x32010) has its root on the A string at fret 3;
// open G (320003) has its root on the low E string at fret 3. Transposing
// each open-chord shape to an arbitrary target root and solving for where
// its root note lands algebraically reduces to the same formula regardless
// of which chord you started from -- which is why C and A (both rooted on
// the A string in their open form) share one anchor fret for a given target
// root, and G and E (both rooted on the low E string) share the other --
// one shape extends back from that shared anchor and the next extends
// forward from it, overlapping by a fret or two, matching how CAGED
// positions are conventionally drawn as a connected chain up the neck.
//
// The window widths extend a fret or two past the bare chord tones to
// cover the full scale (not just the triad) playable in that hand
// position -- that part follows standard convention rather than pure
// chord-tone math, so if a window feels a fret off once you can see it
// rendered, that's the piece most likely to need adjusting.
const SHAPE_DEFS: Record<CagedShape, { anchorString: GuitarString; windowStart: number; windowEnd: number }> = {
  E: { anchorString: GuitarString.E, windowStart: 0, windowEnd: 4 },
  G: { anchorString: GuitarString.E, windowStart: -4, windowEnd: 0 },
  C: { anchorString: GuitarString.A, windowStart: -3, windowEnd: 1 },
  A: { anchorString: GuitarString.A, windowStart: 0, windowEnd: 4 },
  // NOT symmetric [-2, +2]: the D and E strings are a fixed 2 semitones
  // apart, so a symmetric window here makes D-shape's range collapse to be
  // *exactly* E-shape's range for every single root (verified empirically,
  // not just suspected). This window instead follows the actual open D
  // chord's own tone span (root on the D string, other notes 0-3 frets
  // forward -- see open D = xx0232) plus one fret back for scale
  // completeness.
  D: { anchorString: GuitarString.D, windowStart: -1, windowEnd: 3 },
};

// Guitar strings are tuned to notes whose names match the enum values
// (GuitarString.e is the high e string, distinct from GuitarString.E).
function openStringNote(str: GuitarString): string {
  return str.toUpperCase();
}

export function fretForNoteOnString(note: string, str: GuitarString): number {
  const openIndex = NOTE_ORDER.indexOf(openStringNote(str));
  const noteIndex = NOTE_ORDER.indexOf(note.toUpperCase());
  if (openIndex === -1 || noteIndex === -1) {
    throw new Error(`Unrecognized note: "${note}" or string: "${str}"`);
  }
  return (noteIndex - openIndex + NOTE_ORDER.length) % NOTE_ORDER.length;
}

// Returns the [start, end] fret range (inclusive) for the given CAGED shape
// and root note, or null if it doesn't fit anywhere on a fretboard with
// numberOfFrets frets.
export function getCagedShapeFretRange(
  root: string,
  shape: CagedShape,
  numberOfFrets: number
): [number, number] | null {
  const { anchorString, windowStart, windowEnd } = SHAPE_DEFS[shape];
  const anchorFret = fretForNoteOnString(root, anchorString);

  // Clip at the nut rather than jumping a whole octave higher when the
  // window would start below fret 0 -- shapes anchored close to the open
  // position (e.g. D-shape rooted at D, which IS the open D chord) are
  // supposed to show up truncated right at the nut, not skip past it.
  const start = Math.max(0, anchorFret + windowStart);
  const end = Math.min(numberOfFrets, anchorFret + windowEnd);
  if (start > end) {
    return null;
  }
  return [start, end];
}

export function filterToCagedShape<T extends { fret: number }>(
  notes: T[],
  root: string,
  shape: CagedShape,
  numberOfFrets: number
): T[] {
  const range = getCagedShapeFretRange(root, shape, numberOfFrets);
  if (!range) {
    return [];
  }
  const [start, end] = range;
  return notes.filter((note) => note.fret >= start && note.fret <= end);
}
