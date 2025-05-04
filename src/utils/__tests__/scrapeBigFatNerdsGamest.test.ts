import { scrapeBigFatNerdsGames } from '../scrapeBigFatNerdsGames.ts';
import { expect } from "jsr:@std/expect";

Deno.test('scrapeBigFatNerdsGames should return the correct number of games', async () => {
    const games = await scrapeBigFatNerdsGames();
    console.log(games);
    expect(games.length).toBe(13);
});