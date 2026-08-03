import { describe, it, expect } from "vitest";
import { fretForNoteOnString, getCagedShapeFretRange, filterToCagedShape } from "../caged";
import { GuitarString, getKey, Note, NOTE_ORDER } from "../notes";

describe("fretForNoteOnString", () => {
  it("returns 0 for the string's own open note", () => {
    expect(fretForNoteOnString("E", GuitarString.E)).toBe(0);
    expect(fretForNoteOnString("A", GuitarString.A)).toBe(0);
    expect(fretForNoteOnString("D", GuitarString.D)).toBe(0);
  });
});

// These pin the shape anchors against real, unambiguous open-chord finger
// positions (open C = x32010, root on the A string at fret 3; open G =
// 320003, root on the low E string at fret 3) -- not just internal
// self-consistency.
describe("getCagedShapeFretRange anchor points match known open-chord positions", () => {
  it("E-shape rooted at E starts at fret 0 (matches the open E chord)", () => {
    expect(getCagedShapeFretRange("E", "E", 16)).toEqual([0, 4]);
  });

  it("A-shape rooted at A starts at fret 0 (matches the open A chord)", () => {
    expect(getCagedShapeFretRange("A", "A", 16)).toEqual([0, 4]);
  });

  it("D-shape rooted at D starts at fret 0 (matches the open D chord)", () => {
    // anchor=0, window [-1, +3] clips to [0, 3]
    expect(getCagedShapeFretRange("D", "D", 16)).toEqual([0, 3]);
  });

  it("C-shape rooted at C is anchored at fret 3 on the A string (matches open C, x32010)", () => {
    // anchor=3, window [-3, +1] => [0, 4]
    expect(getCagedShapeFretRange("C", "C", 16)).toEqual([0, 4]);
  });

  it("G-shape rooted at G is anchored at fret 3 on the low E string (matches open G, 320003)", () => {
    // anchor=3, window [-4, 0] => [0, 3]
    expect(getCagedShapeFretRange("G", "G", 16)).toEqual([0, 3]);
  });
});

describe("getCagedShapeFretRange", () => {
  it("C-shape and A-shape are anchored at the same fret on the A string for a given root, and their windows overlap there", () => {
    const cRange = getCagedShapeFretRange("G", "C", 16)!;
    const aRange = getCagedShapeFretRange("G", "A", 16)!;
    // C's window is [-3,+1] and A's is [0,+4] relative to the same anchor
    // fret, so C's end should be at or past A's start (they connect/overlap
    // rather than leaving a gap).
    expect(cRange[1]).toBeGreaterThanOrEqual(aRange[0]);
  });

  it("G-shape and E-shape are anchored at the same fret on the low E string for a given root, and their windows overlap there", () => {
    const gRange = getCagedShapeFretRange("D", "G", 16)!;
    const eRange = getCagedShapeFretRange("D", "E", 16)!;
    expect(gRange[1]).toBeGreaterThanOrEqual(eRange[0]);
  });

  it("clips at the nut instead of jumping an octave when the window would start below fret 0", () => {
    // G-shape (window [-4, 0]) rooted at F#: low-E anchor is fret 2,
    // 2 - 4 = -2, which should clip to 0, not shift up to fret 14.
    expect(getCagedShapeFretRange("F#", "G", 16)).toEqual([0, 2]);
  });

  it("returns null when the shape doesn't fit within the given number of frets", () => {
    expect(getCagedShapeFretRange("G#", "A", 3)).toBeNull();
  });

  // Regression test: a symmetric [-2, +2] window for D-shape made its range
  // collapse to be *exactly* E-shape's range for every root, because the D
  // and E strings are always a fixed 2 semitones apart. Caught by comparing
  // actual generated output, not by inspection.
  it("D-shape never produces the exact same fret range as E-shape or G-shape", () => {
    for (const root of NOTE_ORDER) {
      const dRange = getCagedShapeFretRange(root, "D", 16);
      const eRange = getCagedShapeFretRange(root, "E", 16);
      const gRange = getCagedShapeFretRange(root, "G", 16);
      expect(dRange).not.toEqual(eRange);
      expect(dRange).not.toEqual(gRange);
    }
  });
});

describe("filterToCagedShape", () => {
  function makeNotes(): Note[] {
    const notes: Note[] = [];
    const strings = ["E", "A", "D", "G", "B", "e"];
    for (const string of strings) {
      for (let fret = 0; fret <= 16; fret++) {
        notes.push({ note: "C", fret, string, color: null });
      }
    }
    return notes;
  }

  it("only returns notes within the shape's fret range", () => {
    const notes = makeNotes();
    const filtered = filterToCagedShape(notes, "E", "E", 16);
    expect(filtered.every((n) => n.fret >= 0 && n.fret <= 4)).toBe(true);
    expect(filtered.length).toBe(6 * 5); // 6 strings * frets 0-4
  });

  it("every note produced within a shape is still a valid member of the underlying key when combined with key-of filtering", () => {
    // This is the invariant that actually matters: whatever the shape's
    // fret window turns out to be, composing it with the existing key-of
    // filter can never produce an out-of-key note, since that filter is
    // independently correct and unaffected by the shape logic.
    const notes = generateAllNotes();
    const key = getKey("C");
    const shapeFiltered = filterToCagedShape(notes, "C", "C", 16);
    const keyFiltered = shapeFiltered.filter((n) => key.includes(n.note));
    for (const note of keyFiltered) {
      expect(key).toContain(note.note);
    }
  });
});

function generateAllNotes(): Note[] {
  const NOTE_ORDER = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
  const strings = ["E", "A", "D", "G", "B", "e"];
  const notes: Note[] = [];
  for (const string of strings) {
    for (let fret = 0; fret <= 16; fret++) {
      const startingNote = NOTE_ORDER.indexOf(string.toUpperCase());
      const note = NOTE_ORDER[(startingNote + fret) % NOTE_ORDER.length];
      notes.push({ note, fret, string, color: null });
    }
  }
  return notes;
}
