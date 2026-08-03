import { NOTE_ORDER, GuitarString } from "./notes";

export type CagedShape = "C" | "A" | "G" | "E" | "D";

type ChordTonePosition = { string: GuitarString; fret: number };

// CAGED shapes are the 5 open chord shapes (C, A, G, E, D) played as
// movable/barred voicings up the neck. Each one is just that open chord's
// own fingering -- root, 3rd, and 5th only, with whichever of those get
// doubled by the open strings the shape happens to use. Verified against
// the standard open-chord fret patterns (C=x32010, A=x02220, G=320003,
// E=022100, D=xx0232) rather than derived/guessed.
const OPEN_CHORD_SHAPES: Record<CagedShape, { rootNote: string; positions: ChordTonePosition[] }> = {
  C: {
    rootNote: "C",
    positions: [
      { string: GuitarString.A, fret: 3 }, // root
      { string: GuitarString.D, fret: 2 }, // 3rd
      { string: GuitarString.G, fret: 0 }, // 5th
      { string: GuitarString.B, fret: 1 }, // root
      { string: GuitarString.e, fret: 0 }, // 3rd
    ],
  },
  A: {
    rootNote: "A",
    positions: [
      { string: GuitarString.A, fret: 0 }, // root
      { string: GuitarString.D, fret: 2 }, // 5th
      { string: GuitarString.G, fret: 2 }, // root
      { string: GuitarString.B, fret: 2 }, // 3rd
      { string: GuitarString.e, fret: 0 }, // 5th
    ],
  },
  G: {
    rootNote: "G",
    positions: [
      { string: GuitarString.E, fret: 3 }, // root
      { string: GuitarString.A, fret: 2 }, // 3rd
      { string: GuitarString.D, fret: 0 }, // 5th
      { string: GuitarString.G, fret: 0 }, // root
      { string: GuitarString.B, fret: 0 }, // 3rd
      { string: GuitarString.e, fret: 3 }, // root
    ],
  },
  E: {
    rootNote: "E",
    positions: [
      { string: GuitarString.E, fret: 0 }, // root
      { string: GuitarString.A, fret: 2 }, // 5th
      { string: GuitarString.D, fret: 2 }, // root
      { string: GuitarString.G, fret: 1 }, // 3rd
      { string: GuitarString.B, fret: 0 }, // 5th
      { string: GuitarString.e, fret: 0 }, // root
    ],
  },
  D: {
    rootNote: "D",
    positions: [
      { string: GuitarString.D, fret: 0 }, // root
      { string: GuitarString.G, fret: 2 }, // 5th
      { string: GuitarString.B, fret: 3 }, // root
      { string: GuitarString.e, fret: 2 }, // 3rd
    ],
  },
};

// Returns the fretted (string, fret) positions for the given shape, moved
// up the neck so its root lands on the requested root note. Passing the
// shape's own natural root (e.g. "C" for the C-shape) returns the open
// chord unchanged (shift 0).
export function getCagedChordTonePositions(root: string, shape: CagedShape): ChordTonePosition[] {
  const { rootNote, positions } = OPEN_CHORD_SHAPES[shape];
  const shift =
    (NOTE_ORDER.indexOf(root.toUpperCase()) - NOTE_ORDER.indexOf(rootNote) + NOTE_ORDER.length) % NOTE_ORDER.length;
  return positions.map((p) => ({ string: p.string, fret: p.fret + shift }));
}

export function filterToCagedChordTones<T extends { string: string; fret: number }>(
  notes: T[],
  root: string,
  shape: CagedShape
): T[] {
  const positions = getCagedChordTonePositions(root, shape);
  return notes.filter((note) => positions.some((p) => p.string === note.string && p.fret === note.fret));
}
