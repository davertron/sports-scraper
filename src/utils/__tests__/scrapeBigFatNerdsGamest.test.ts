import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { scrapeBigFatNerdsGames } from '../scrapeBigFatNerdsGames.ts';

// Mirrors date-fns' format(date, 'h:mm a'), which formats in the local
// (system) timezone -- this test relies on the machine running in
// America/New_York, same as it did before this migration.
function formatLocalTime(timestampMs: number): string {
    return new Date(timestampMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Mock the fetch function
const originalFetch = globalThis.fetch;
globalThis.fetch = (input: RequestInfo | URL) => {
    const url = input.toString();
    // Mock schedule tab (gid=0)
    if (url.includes('gid=0')) {
        return Promise.resolve({
            text: () => readFile("./src/utils/__tests__/__mocks__/bigfatnerds-schedule.tsv", "utf-8"),
            ok: true,
            status: 200,
            statusText: "OK",
            headers: new Headers(),
        } as Response);
    }
    // Mock results tab (gid=520016829)
    if (url.includes('gid=520016829')) {
        return Promise.resolve({
            text: () => readFile("./src/utils/__tests__/__mocks__/bigfatnerds-results.tsv", "utf-8"),
            ok: true,
            status: 200,
            statusText: "OK",
            headers: new Headers(),
        } as Response);
    }
    return originalFetch(input);
};

test('scrapeBigFatNerdsGames should return the correct number of games', async () => {
    const games = await scrapeBigFatNerdsGames();
    assert.equal(games.length, 14);
});

test('scrapeBigFatNerdsGames should have properly formatted dates', async () => {
    const games = await scrapeBigFatNerdsGames();
    assert.equal(new Date(games[0].eventStartTime).toISOString(), "2025-05-07T22:00:00.000Z");
    assert.equal(formatLocalTime(games[0].eventStartTime), "6:00 PM");
});

// Clean up after tests
after(() => {
    globalThis.fetch = originalFetch;
});

