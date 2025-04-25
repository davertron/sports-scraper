import { Game } from "../types.ts";
import { formatIcePackGame, formatDruckermanGame, formatGameTime } from "../utils/formatters.ts";

const response = await fetch("https://d1msdfi79mlr9u.cloudfront.net/hockey-games/latest.json");
const games = await response.json() as Game[];

export const nextIcePackGame = games.find(game => game.team === "Ice Pack" && game.eventStartTime > Date.now());
export const nextDruckermanGame = games.find(game => game.team === "Druckerman" && game.eventStartTime > Date.now());

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