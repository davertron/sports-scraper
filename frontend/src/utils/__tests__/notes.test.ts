import { describe, it, expect } from "vitest";
import { getChordTones } from "../notes";

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
