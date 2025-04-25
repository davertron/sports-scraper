import { scrapeDruckermanGames } from "../utils/scrapeDruckermanGames.ts";
import { scrapeIcePackGames } from "../utils/scrapeIcePackGames.ts";
import { Game } from "../types.ts";
import { formatIcePackGame, formatDruckermanGame, formatGameTime } from "../utils/formatters.ts";

const [dGames, iGames] = await Promise.all([scrapeDruckermanGames(), scrapeIcePackGames()]);

export const games = [
    ...dGames,
    ...iGames,
]

export const nextIcePackGame = iGames.find(game => game.eventStartTime > Date.now());
export const nextDruckermanGame = dGames.find(game => game.eventStartTime > Date.now());

export const nextIcePackGameFormatted = formatIcePackGame(nextIcePackGame);
export const nextDruckermanGameFormatted = formatDruckermanGame(nextDruckermanGame);


function convertToTableRow(game: Game): {
  isPastGame: boolean;
  teamDisplay: string;
  gameTime: string;
  rink: string;
  score: string;
} {
  const teamDisplay = game.team === "Ice Pack" ? `${game.team} vs. ${game.opponent}` : game.team;
  const isPastGame = game.eventStartTime < Date.now();
  return {
    isPastGame,
    teamDisplay,
    gameTime: formatGameTime(game),
    rink: game.rink,
    score: game.score || '-',
  };
}

export const tableRows = games.sort((a, b) => a.eventStartTime - b.eventStartTime)
    .map(convertToTableRow);