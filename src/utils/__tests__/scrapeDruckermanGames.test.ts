import { test, after } from "node:test";
import assert from "node:assert/strict";
import type { Game } from "../../types.ts";
import { scrapeDruckermanGames } from "../scrapeDruckermanGames.ts";

const cairnsHtml = `
<html><body><script>
var _onlineScheduleList = [
  {"AccountName":"Druckerman","EventStartTime":"2025-04-11T06:40:00","EventEndTime":"2025-04-11T07:40:00","FacilityName":"Rink 2","EventId":"12345"},
  {"AccountName":"Some Other League","EventStartTime":"2025-04-12T06:40:00","EventEndTime":"2025-04-12T07:40:00","FacilityName":"Rink 1","EventId":"99999"}
];
</script></body></html>
`;

const essexJson = JSON.stringify([
  { start: "2025-09-05T18:00:00", end: "2025-09-05T19:00:00", id: "1001" },
  { start: "2025-09-06T18:00:00", end: "2025-09-06T19:00:00", id: "1002" },
]);

// Mock the fetch function
const originalFetch = globalThis.fetch;
function installMockFetch() {
  globalThis.fetch = (input: RequestInfo | URL) => {
    const url = input.toString();
    if (url.includes("cairnsarena.finnlyconnect.com")) {
      return Promise.resolve({ text: () => Promise.resolve(cairnsHtml), ok: true, status: 200 } as Response);
    }
    if (url.includes("vt3.mlschedules.com")) {
      return Promise.resolve({ json: () => Promise.resolve(JSON.parse(essexJson)), ok: true, status: 200 } as Response);
    }
    return originalFetch(input);
  };
}
installMockFetch();

test("scrapeDruckermanGames only includes Druckerman-account Cairns games", async () => {
  const games = await scrapeDruckermanGames() as Game[];
  const cairnsGames = games.filter((g: Game) => g.sourceId.startsWith("cairns-"));
  assert.equal(cairnsGames.length, 1);
  assert.equal(cairnsGames[0].sourceId, "cairns-12345");
});

test("scrapeDruckermanGames parses Cairns dates as America/New_York", async () => {
  const games = await scrapeDruckermanGames() as Game[];
  const cairns = games.find((g: Game) => g.sourceId === "cairns-12345")!;
  assert.equal(new Date(cairns.eventStartTime).toISOString(), "2025-04-11T10:40:00.000Z");
  assert.equal(new Date(cairns.eventEndTime).toISOString(), "2025-04-11T11:40:00.000Z");
  assert.equal(cairns.rink, "Cairns 2"); // "Rink 2" -> "Cairns 2"
});

test("scrapeDruckermanGames parses Essex dates as America/New_York", async () => {
  const games = await scrapeDruckermanGames() as Game[];
  const essex = games.filter((g: Game) => g.sourceId.startsWith("essex-"));
  assert.equal(essex.length, 2);

  const first = essex.find((g: Game) => g.sourceId === "essex-1001")!;
  assert.equal(new Date(first.eventStartTime).toISOString(), "2025-09-05T22:00:00.000Z");
  assert.equal(new Date(first.eventEndTime).toISOString(), "2025-09-05T23:00:00.000Z");
  assert.equal(first.rink, "Essex");
});

test("scrapeDruckermanGames sorts all games (Cairns + Essex) by start time", async () => {
  const games = await scrapeDruckermanGames() as Game[];
  for (let i = 1; i < games.length; i++) {
    assert.ok(games[i - 1].eventStartTime <= games[i].eventStartTime);
  }
});

test("scrapeDruckermanGames with raw:true returns unprocessed source data", async () => {
  const games = await scrapeDruckermanGames({ raw: true });
  // 1 raw Cairns game (Druckerman-only, unfiltered fields) + 2 raw Essex events
  assert.equal(games.length, 3);
  const cairnsRaw = games.find((g: object) => "EventId" in g) as { EventId: string; AccountName: string };
  assert.equal(cairnsRaw.EventId, "12345");
  assert.equal(cairnsRaw.AccountName, "Druckerman");
});

after(() => {
  globalThis.fetch = originalFetch;
});
