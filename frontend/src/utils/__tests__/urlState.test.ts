import { describe, it, expect, beforeEach } from "vitest";
import { loadBoardsFromUrl, encodeBoardsForUrl, syncBoardsToUrl } from "../urlState";
import { Transform } from "../transforms";

const BOARD_A: Transform[] = [
  { type: "filter", args: ["key-of", "C"] },
  { type: "map", args: ["color-notes", "C", "#FF0000"] },
];

const BOARD_B: Transform[] = [{ type: "filter", args: ["chord-of", "G", "major"] }];

beforeEach(() => {
  window.history.replaceState(null, "", "/guitar/");
});

describe("loadBoardsFromUrl", () => {
  it("returns null when there's no state param", () => {
    expect(loadBoardsFromUrl("https://davertron.com/guitar/")).toBeNull();
  });

  it("returns null for corrupted base64", () => {
    expect(loadBoardsFromUrl("https://davertron.com/guitar/?state=not-valid-base64!!!")).toBeNull();
  });

  it("returns null for valid base64 that isn't JSON", () => {
    const encoded = btoa("not json");
    expect(loadBoardsFromUrl(`https://davertron.com/guitar/?state=${encoded}`)).toBeNull();
  });

  it("returns null for valid JSON that isn't shaped like boards (e.g. a future/incompatible link)", () => {
    const encoded = btoa(JSON.stringify({ some: "other shape" }));
    expect(loadBoardsFromUrl(`https://davertron.com/guitar/?state=${encoded}`)).toBeNull();
  });

  it("round-trips multiple boards through encodeBoardsForUrl", () => {
    const encoded = encodeBoardsForUrl([BOARD_A, BOARD_B]);
    expect(loadBoardsFromUrl(`https://davertron.com/guitar/?state=${encoded}`)).toEqual([BOARD_A, BOARD_B]);
  });

  it("treats a pre-multi-fretboard link (a single Transform[], not an array of them) as one board", () => {
    const encoded = btoa(JSON.stringify(BOARD_A));
    expect(loadBoardsFromUrl(`https://davertron.com/guitar/?state=${encoded}`)).toEqual([BOARD_A]);
  });
});

describe("syncBoardsToUrl", () => {
  it("updates the current page's URL with an encoded state param, without adding a history entry", () => {
    const before = window.history.length;
    syncBoardsToUrl([BOARD_A, BOARD_B]);

    expect(window.history.length).toBe(before); // replaceState, not pushState
    expect(loadBoardsFromUrl(window.location.href)).toEqual([BOARD_A, BOARD_B]);
  });
});
