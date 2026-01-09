import { scrapeIcePackGames } from '../scrapeIcePackGames.ts';
import { expect } from "jsr:@std/expect";

// Mock the fetch function
const originalFetch = globalThis.fetch;
globalThis.fetch = (input: RequestInfo | URL) => {
    const url = input.toString();
    if (url.includes('fullstridestaging.com/schedule_nf.php')) {
        return Promise.resolve({
            text: () => Deno.readTextFile("./src/utils/__tests__/__mocks__/icepack-schedule.html"),
            ok: true,
            status: 200,
            headers: new Headers(),
        } as Response);
    }
    return originalFetch(input);
};

Deno.test('scrapeIcePackGames should have properly formatted dates', async () => {
    const games = await scrapeIcePackGames();
    expect(games.length).toBe(6);
    expect(new Date(games[0].eventStartTime).toISOString()).toBe("2026-05-07T01:00:00.000Z");
    expect(new Date(games[0].eventStartTime).toLocaleString()).toBe("5/6/2026, 9:00:00 PM");
});

Deno.test('scrapeIcePackGames should return no games if there are no ice pack games', async () => {
    globalThis.fetch = (input: RequestInfo | URL) => {
        const url = input.toString();
        if (/fullstridestaging/.test(url)) {
            return Promise.resolve({
                text: () => Deno.readTextFile("./src/utils/__tests__/__mocks__/empty-icepack-schedule.html"),
                ok: true,
                status: 200,
                headers: new Headers(),
            } as Response);
        }
        return originalFetch(input);
    };

    const games = await scrapeIcePackGames();
    expect(games.length).toBe(0);
});

// Clean up after tests
Deno.test('cleanup', () => {
    globalThis.fetch = originalFetch;
});

