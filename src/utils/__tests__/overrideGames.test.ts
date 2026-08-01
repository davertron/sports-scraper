import { test } from "node:test";
import assert from "node:assert/strict";
import type { Game } from "../../types.ts";
import { overrideGames } from "../overrideGames.ts";

// Builds a local Date for the given month/day at a fixed time of day, matching
// the system-local-timezone semantics that overrideGames relies on.
function localDateMillis(month: number, day: number): number {
  return new Date(2025, month - 1, day, 18, 0, 0).getTime();
}

function makeGame(overrides: Partial<Game>): Game {
  return {
    eventStartTime: localDateMillis(1, 1),
    eventEndTime: localDateMillis(1, 1) + 60 * 60 * 1000,
    rink: "Some Field",
    opponent: "Some Team",
    score: "",
    team: "Big Fat Nerds",
    sourceId: "test-1",
    ...overrides,
  };
}

test("overrideGames sets the score for the 5/7/2025 Big Fat Nerds game", () => {
  const game = makeGame({ eventStartTime: localDateMillis(5, 7), sourceId: "may7" });
  const [result] = overrideGames([game]);
  assert.equal(result.score, "1-2");
});

test("overrideGames sets the score for the 5/14/2025 Big Fat Nerds game", () => {
  const game = makeGame({ eventStartTime: localDateMillis(5, 14), sourceId: "may14" });
  const [result] = overrideGames([game]);
  assert.equal(result.score, "3-1");
});

test("overrideGames sets the score for the 5/28/2025 Big Fat Nerds game", () => {
  const game = makeGame({ eventStartTime: localDateMillis(5, 28), sourceId: "may28" });
  const [result] = overrideGames([game]);
  assert.equal(result.score, "3-3");
});

test("overrideGames leaves Big Fat Nerds games on other dates untouched", () => {
  const game = makeGame({ eventStartTime: localDateMillis(5, 8), score: "original", sourceId: "may8" });
  const [result] = overrideGames([game]);
  assert.equal(result.score, "original");
});

test("overrideGames does not touch a non-Big-Fat-Nerds game on a matching date", () => {
  const game = makeGame({
    team: "Ice Pack",
    eventStartTime: localDateMillis(5, 7),
    score: "original",
    sourceId: "icepack-may7",
  });
  const [result] = overrideGames([game]);
  assert.equal(result.score, "original");
});

test("overrideGames only rewrites the matching games in a mixed list", () => {
  const untouched = makeGame({ eventStartTime: localDateMillis(6, 1), score: "keep", sourceId: "untouched" });
  const matched = makeGame({ eventStartTime: localDateMillis(5, 14), sourceId: "matched" });
  const [first, second] = overrideGames([untouched, matched]);
  assert.equal(first.score, "keep");
  assert.equal(second.score, "3-1");
});
