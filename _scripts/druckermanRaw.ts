import { scrapeDruckermanGames } from "../src/utils/scrapeDruckermanGames.ts";

const games = await scrapeDruckermanGames({raw: true});
console.log(games);
