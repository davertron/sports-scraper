import { describe, it, expect } from "vitest";
import { getChordTones, getPentatonicTones } from "../notes";

describe("getChordTones", () => {
  it("returns root, major 3rd, and perfect 5th for a major chord", () => {
    expect(getChordTones("C", "major")).toEqual(["C", "E", "G"]);
    expect(getChordTones("G", "major")).toEqual(["G", "B", "D"]);
  });

  it("returns root, minor 3rd, and perfect 5th for a minor chord", () => {
    expect(getChordTones("A", "minor")).toEqual(["A", "C", "E"]);
    expect(getChordTones("C", "minor")).toEqual(["C", "D#", "G"]);
  });

  it("defaults to major when no quality is given", () => {
    expect(getChordTones("D")).toEqual(getChordTones("D", "major"));
  });
});

describe("getPentatonicTones", () => {
  it("matches the famous A minor pentatonic (A, C, D, E, G)", () => {
    expect(getPentatonicTones("A", "minor")).toEqual(["A", "C", "D", "E", "G"]);
  });

  it("matches C major pentatonic (C, D, E, G, A)", () => {
    expect(getPentatonicTones("C", "major")).toEqual(["C", "D", "E", "G", "A"]);
  });

  it("omits the 4th and 7th of the major scale", () => {
    const major = getPentatonicTones("C", "major");
    expect(major).not.toContain("F"); // 4th
    expect(major).not.toContain("B"); // 7th
  });

  it("omits the 2nd and 6th of the natural minor scale", () => {
    const minor = getPentatonicTones("A", "minor");
    expect(minor).not.toContain("B"); // 2nd
    expect(minor).not.toContain("F"); // 6th
  });

  it("defaults to major when no quality is given", () => {
    expect(getPentatonicTones("G")).toEqual(getPentatonicTones("G", "major"));
  });
});
