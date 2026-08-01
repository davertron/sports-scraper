import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { scrapeIcePackGames } from '../scrapeIcePackGames.ts';

// Mock the fetch function
const originalFetch = globalThis.fetch;
globalThis.fetch = (input: RequestInfo | URL) => {
    const url = input.toString();
    if (url.includes('fullstridestaging.com/schedule_nf.php')) {
        return Promise.resolve({
            text: () => readFile("./src/utils/__tests__/__mocks__/icepack-schedule.html", "utf-8"),
            ok: true,
            status: 200,
            headers: new Headers(),
        } as Response);
    }
    return originalFetch(input);
};

test('scrapeIcePackGames should have properly formatted dates', async () => {
    const games = await scrapeIcePackGames();
    assert.equal(games.length, 6);
    assert.equal(new Date(games[0].eventStartTime).toISOString(), "2026-05-07T01:00:00.000Z");
    assert.equal(new Date(games[0].eventStartTime).toLocaleString(), "5/6/2026, 9:00:00 PM");
});

test('scrapeIcePackGames should return no games if there are no ice pack games', async () => {
    globalThis.fetch = (input: RequestInfo | URL) => {
        const url = input.toString();
        if (/fullstridestaging/.test(url)) {
            return Promise.resolve({
                text: () => readFile("./src/utils/__tests__/__mocks__/empty-icepack-schedule.html", "utf-8"),
                ok: true,
                status: 200,
                headers: new Headers(),
            } as Response);
        }
        return originalFetch(input);
    };

    const games = await scrapeIcePackGames();
    assert.equal(games.length, 0);
});

// Clean up after tests
after(() => {
    globalThis.fetch = originalFetch;
});

