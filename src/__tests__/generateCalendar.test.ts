import { test } from "node:test";
import assert from "node:assert/strict";
import type { Game } from "../types.ts";
import { generateICS } from "../generateCalendar.ts";

function makeGame(overrides: Partial<Game>): Game {
  return {
    eventStartTime: Date.parse("2025-01-15T19:30:00.000Z"),
    eventEndTime: Date.parse("2025-01-15T20:30:00.000Z"),
    rink: "Cairns 1",
    opponent: "",
    score: "",
    team: "Ice Pack",
    sourceId: "test-1",
    ...overrides,
  };
}

test("generateICS wraps games in a valid VCALENDAR envelope", () => {
  const ics = generateICS("My Schedule", [makeGame({})]);
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /\r\nEND:VCALENDAR$/);
  assert.match(ics, /X-WR-CALNAME:My Schedule/);
  assert.match(ics, /X-WR-TIMEZONE:America\/New_York/);
});

test("generateICS formats event start/end as ICS-basic UTC timestamps", () => {
  const ics = generateICS("Schedule", [makeGame({})]);
  // 2025-01-15T19:30:00.000Z -> 20250115T193000Z (dashes/colons/millis stripped)
  assert.match(ics, /DTSTART:20250115T193000Z/);
  assert.match(ics, /DTEND:20250115T203000Z/);
});

test("generateICS skips games missing eventStartTime or eventEndTime", () => {
  const valid = makeGame({ sourceId: "valid" });
  const missingStart = makeGame({ sourceId: "missing-start", eventStartTime: 0 });
  const missingEnd = makeGame({ sourceId: "missing-end", eventEndTime: 0 });

  const ics = generateICS("Schedule", [valid, missingStart, missingEnd]);
  const eventCount = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
  assert.equal(eventCount, 1);
});

test("generateICS formats Ice Pack games with opponent and no Tree Farm Map link", () => {
  const ics = generateICS("Schedule", [makeGame({ team: "Ice Pack", rink: "Cairns 1", opponent: "Red Dogs" })]);
  assert.match(ics, /SUMMARY:🏒 Cairns 1 - Ice Pack vs Red Dogs/);
  assert.doesNotMatch(ics, /Tree Farm Map/);
});

test("generateICS falls back to 'TBD' when Ice Pack opponent is missing", () => {
  const ics = generateICS("Schedule", [makeGame({ team: "Ice Pack", opponent: "" })]);
  assert.match(ics, /vs TBD/);
});

test("generateICS formats Druckerman games as a 'Skate' with no opponent", () => {
  const ics = generateICS("Schedule", [makeGame({ team: "Druckerman", rink: "Essex" })]);
  assert.match(ics, /SUMMARY:🏒 Essex - Druckerman Skate/);
  assert.doesNotMatch(ics, /Tree Farm Map/);
});

test("generateICS formats Big Fat Nerds games with opponent and includes the Tree Farm Map link", () => {
  const ics = generateICS("Schedule", [makeGame({ team: "Big Fat Nerds", rink: "TF 10", opponent: "Foot Clan FC" })]);
  assert.match(ics, /SUMMARY:⚽ TF 10 - Big Fat Nerds vs Foot Clan FC/);
  assert.match(ics, /Tree Farm Map: https:\/\/s3\.us-east-1\.amazonaws\.com\/files\.davertron\.com\/treefarm_map\.jpg/);
});

test("generateICS treats an unrecognized team like Big Fat Nerds (default branch)", () => {
  const ics = generateICS("Schedule", [makeGame({ team: "Some New League", rink: "Field 1", opponent: "Rivals" })]);
  assert.match(ics, /SUMMARY:⚽ Field 1 - Some New League vs Rivals/);
  assert.match(ics, /Tree Farm Map/);
});

test("generateICS includes the score in the description when present", () => {
  const ics = generateICS("Schedule", [makeGame({ team: "Ice Pack", score: "3 - 2" })]);
  assert.match(ics, /DESCRIPTION:Score: 3 - 2/);
});

test("generateICS emits an empty DESCRIPTION when there is no score (non-BFN team)", () => {
  const ics = generateICS("Schedule", [makeGame({ team: "Ice Pack", score: "" })]);
  assert.match(ics, /DESCRIPTION:\r\n/);
});
