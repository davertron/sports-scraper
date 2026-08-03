import { describe, it, expect, beforeEach } from "vitest";
import { loadTransformsFromUrl, encodeTransformsForUrl, syncTransformsToUrl } from "../urlState";
import { Transform } from "../transforms";

const SAMPLE: Transform[] = [
  { type: "filter", args: ["key-of", "C"] },
  { type: "map", args: ["color-notes", "C", "#FF0000"] },
];

beforeEach(() => {
  window.history.replaceState(null, "", "/guitar/");
});

describe("loadTransformsFromUrl", () => {
  it("returns null when there's no state param", () => {
    expect(loadTransformsFromUrl("https://davertron.com/guitar/")).toBeNull();
  });

  it("returns null for corrupted base64", () => {
    expect(loadTransformsFromUrl("https://davertron.com/guitar/?state=not-valid-base64!!!")).toBeNull();
  });

  it("returns null for valid base64 that isn't JSON", () => {
    const encoded = btoa("not json");
    expect(loadTransformsFromUrl(`https://davertron.com/guitar/?state=${encoded}`)).toBeNull();
  });

  it("returns null for valid JSON that isn't a Transform[] (e.g. a future/incompatible link)", () => {
    const encoded = btoa(JSON.stringify({ some: "other shape" }));
    expect(loadTransformsFromUrl(`https://davertron.com/guitar/?state=${encoded}`)).toBeNull();
  });

  it("round-trips a real Transform[] through encodeTransformsForUrl", () => {
    const encoded = encodeTransformsForUrl(SAMPLE);
    expect(loadTransformsFromUrl(`https://davertron.com/guitar/?state=${encoded}`)).toEqual(SAMPLE);
  });
});

describe("syncTransformsToUrl", () => {
  it("updates the current page's URL with an encoded state param, without adding a history entry", () => {
    const before = window.history.length;
    syncTransformsToUrl(SAMPLE);

    expect(window.history.length).toBe(before); // replaceState, not pushState
    expect(loadTransformsFromUrl(window.location.href)).toEqual(SAMPLE);
  });
});
