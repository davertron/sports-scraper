import { scrapeBigFatNerdsGames } from '../scrapeBigFatNerdsGames.ts';
import { expect } from "@std/expect";
import { format } from "date-fns";

// Mock the fetch function
const originalFetch = globalThis.fetch;
globalThis.fetch = (input: RequestInfo | URL) => {
    const url = input.toString();
    // Mock schedule tab (gid=0)
    if (url.includes('gid=0')) {
        return Promise.resolve({
            text: () => Deno.readTextFile("./src/utils/__tests__/__mocks__/bigfatnerds-schedule.tsv"),
            ok: true,
            status: 200,
            statusText: "OK",
            headers: new Headers(),
        } as Response);
    }
    // Mock results tab (gid=520016829)
    if (url.includes('gid=520016829')) {
        return Promise.resolve({
            text: () => Deno.readTextFile("./src/utils/__tests__/__mocks__/bigfatnerds-results.tsv"),
            ok: true,
            status: 200,
            statusText: "OK",
            headers: new Headers(),
        } as Response);
    }
    return originalFetch(input);
};

Deno.test('scrapeBigFatNerdsGames should return the correct number of games', async () => {
    const games = await scrapeBigFatNerdsGames();
    expect(games.length).toBe(14);
});

Deno.test('scrapeBigFatNerdsGames should have properly formatted dates', async () => {
    const games = await scrapeBigFatNerdsGames();
    expect(new Date(games[0].eventStartTime).toISOString()).toBe("2025-05-07T22:00:00.000Z");
    expect(format(games[0].eventStartTime, "h:mm a", {})).toBe("6:00 PM");
});

// Clean up after tests
Deno.test('cleanup', () => {
    globalThis.fetch = originalFetch;
});

