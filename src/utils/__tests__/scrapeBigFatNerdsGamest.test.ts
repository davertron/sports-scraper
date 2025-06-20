import { scrapeBigFatNerdsGames } from '../scrapeBigFatNerdsGames.ts';
import { expect } from "jsr:@std/expect";
import { format } from "https://esm.sh/date-fns@4.1.0";

Deno.test('scrapeBigFatNerdsGames should return the correct number of games', async () => {
    const games = await scrapeBigFatNerdsGames();
    expect(games.length).toBe(14);
});

Deno.test('scrapeBigFatNerdsGames should have properly formatted dates', async () => {
    const games = await scrapeBigFatNerdsGames();
    expect(new Date(games[0].eventStartTime).toISOString()).toBe("2025-05-07T22:00:00.000Z");
    expect(format(games[0].eventStartTime, "h:mm a")).toBe("6:00 PM");
});

