import { describe, it, expect } from "vitest";
import { getCagedChordTonePositions, filterToCagedChordTones } from "../caged";
import { GuitarString, generateNotes } from "../notes";

// Each shape at its own natural root (shift 0) should reproduce the real,
// well-known open chord fingering exactly.
describe("getCagedChordTonePositions at the shape's natural root reproduces the real open chord", () => {
  it("C-shape rooted at C matches open C (x32010)", () => {
    expect(getCagedChordTonePositions("C", "C")).toEqual([
      { string: GuitarString.A, fret: 3 },
      { string: GuitarString.D, fret: 2 },
      { string: GuitarString.G, fret: 0 },
      { string: GuitarString.B, fret: 1 },
      { string: GuitarString.e, fret: 0 },
    ]);
  });

  it("A-shape rooted at A matches open A (x02220)", () => {
    expect(getCagedChordTonePositions("A", "A")).toEqual([
      { string: GuitarString.A, fret: 0 },
      { string: GuitarString.D, fret: 2 },
      { string: GuitarString.G, fret: 2 },
      { string: GuitarString.B, fret: 2 },
      { string: GuitarString.e, fret: 0 },
    ]);
  });

  it("G-shape rooted at G matches open G (320003)", () => {
    expect(getCagedChordTonePositions("G", "G")).toEqual([
      { string: GuitarString.E, fret: 3 },
      { string: GuitarString.A, fret: 2 },
      { string: GuitarString.D, fret: 0 },
      { string: GuitarString.G, fret: 0 },
      { string: GuitarString.B, fret: 0 },
      { string: GuitarString.e, fret: 3 },
    ]);
  });

  it("E-shape rooted at E matches open E (022100)", () => {
    expect(getCagedChordTonePositions("E", "E")).toEqual([
      { string: GuitarString.E, fret: 0 },
      { string: GuitarString.A, fret: 2 },
      { string: GuitarString.D, fret: 2 },
      { string: GuitarString.G, fret: 1 },
      { string: GuitarString.B, fret: 0 },
      { string: GuitarString.e, fret: 0 },
    ]);
  });

  it("D-shape rooted at D matches open D (xx0232)", () => {
    expect(getCagedChordTonePositions("D", "D")).toEqual([
      { string: GuitarString.D, fret: 0 },
      { string: GuitarString.G, fret: 2 },
      { string: GuitarString.B, fret: 3 },
      { string: GuitarString.e, fret: 2 },
    ]);
  });
});

describe("getCagedChordTonePositions transposes correctly for other roots", () => {
  it("C-shape rooted at D (a whole step up from C) shifts every fret by 2", () => {
    expect(getCagedChordTonePositions("D", "C")).toEqual([
      { string: GuitarString.A, fret: 5 },
      { string: GuitarString.D, fret: 4 },
      { string: GuitarString.G, fret: 2 },
      { string: GuitarString.B, fret: 3 },
      { string: GuitarString.e, fret: 2 },
    ]);
  });

  it("every position's actual note is the correct root, 3rd, or 5th of the target key", () => {
    // Cross-check against generateNotes (already correct/tested elsewhere)
    // instead of hand-computing note names here.
    const all = generateNotes(16);
    const positions = getCagedChordTonePositions("G", "E"); // G major triad: G, B, D
    const notes = positions.map(
      (p) => all.find((n) => n.string === p.string && n.fret === p.fret)!.note
    );
    for (const note of notes) {
      expect(["G", "B", "D"]).toContain(note);
    }
  });
});

describe("filterToCagedChordTones", () => {
  it("returns exactly the chord-tone positions, nothing else", () => {
    const all = generateNotes(16);
    const filtered = filterToCagedChordTones(all, "C", "C");
    expect(filtered.length).toBe(5);
    expect(filtered.map((n) => n.note).sort()).toEqual(["C", "C", "E", "E", "G"]);
  });
});
