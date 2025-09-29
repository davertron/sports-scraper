import { scrapeDruckermanGames } from "../src/utils/scrapeDruckermanGames.ts";

const games = await scrapeDruckermanGames({raw: true});
// const games = await scrapeDruckermanGames();
console.log(games);
