import { test } from "node:test";
import assert from "node:assert/strict";
import { toUTCMillis, monthNameToNumber, to24Hour, zonedMillis, formatTime, formatDateRange } from "../formatters.ts";

test("toUTCMillis interprets the string as America/New_York, DST (EDT, UTC-4)", () => {
  assert.equal(new Date(toUTCMillis("2025-04-11T06:40:00")).toISOString(), "2025-04-11T10:40:00.000Z");
});

test("toUTCMillis interprets the string as America/New_York, standard time (EST, UTC-5)", () => {
  assert.equal(new Date(toUTCMillis("2025-01-15T14:30:00")).toISOString(), "2025-01-15T19:30:00.000Z");
});

test("monthNameToNumber handles abbreviated and full month names, case-insensitively", () => {
  assert.equal(monthNameToNumber("Jan"), 1);
  assert.equal(monthNameToNumber("january"), 1);
  assert.equal(monthNameToNumber("SEPT"), 9);
  assert.equal(monthNameToNumber("September"), 9);
  assert.equal(monthNameToNumber("dec"), 12);
});

test("monthNameToNumber throws on an unrecognized month name", () => {
  assert.throws(() => monthNameToNumber("Frobtember"), /Unrecognized month name/);
});

test("to24Hour handles the noon/midnight boundary correctly", () => {
  assert.equal(to24Hour(12, "am"), 0);  // midnight
  assert.equal(to24Hour(12, "pm"), 12); // noon
});

test("to24Hour handles ordinary AM/PM hours", () => {
  assert.equal(to24Hour(1, "am"), 1);
  assert.equal(to24Hour(1, "pm"), 13);
  assert.equal(to24Hour(11, "pm"), 23);
});

test("to24Hour is case-insensitive on the meridiem marker", () => {
  assert.equal(to24Hour(9, "PM"), 21);
  assert.equal(to24Hour(9, "Pm"), 21);
});

test("zonedMillis builds UTC millis from wall-clock parts, DST (EDT, UTC-4)", () => {
  const millis = zonedMillis({ year: 2025, month: 7, day: 4, hour: 0, minute: 0 });
  assert.equal(new Date(millis).toISOString(), "2025-07-04T04:00:00.000Z");
});

test("zonedMillis builds UTC millis from wall-clock parts, standard time (EST, UTC-5)", () => {
  const millis = zonedMillis({ year: 2025, month: 12, day: 25, hour: 23, minute: 59 });
  assert.equal(new Date(millis).toISOString(), "2025-12-26T04:59:00.000Z");
});

test("formatTime formats in America/New_York regardless of system timezone", () => {
  // 2025-01-15T19:30:00.000Z is 2:30 PM EST
  assert.equal(formatTime(new Date("2025-01-15T19:30:00.000Z")), "2:30 PM");
});

test("formatDateRange formats a Druckerman-style start/end range", () => {
  const start = Date.parse("2025-01-15T19:30:00.000Z"); // 2:30 PM EST
  const end = Date.parse("2025-01-15T20:30:00.000Z");   // 3:30 PM EST
  assert.equal(formatDateRange(start, end), "1/15 2:30 PM - 3:30 PM");
});
