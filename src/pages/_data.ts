import { Game } from "../types.ts";
import { formatGameTime, formatTime } from "../utils/formatters.ts";
import { format, startOfWeek, addDays, isToday, isSameDay, isBefore, startOfDay } from "https://esm.sh/date-fns";

const response = await fetch("https://d1msdfi79mlr9u.cloudfront.net/hockey-games/latest.json");
const games = await response.json() as Game[];

// Let's generate a calendar view for this week and the following two weeks
// Each week starts on Sunday and ends on Saturday
const today = new Date();
const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 }); // 0 = Sunday

type Day = {
  date: Date;
  isToday: boolean;
  isPast: boolean;
  games: Game[];
}

export const nextThreeWeeks: Day[][] = [];
let currentWeek: Day[] = []

for (let i = 0; i < 21; i++) { // 3 weeks * 7 days = 21
  const currentDay = addDays(startOfWeekDate, i);
  currentWeek.push({ 
    date: currentDay, 
    isToday: isToday(currentDay),
    isPast: isBefore(startOfDay(currentDay), startOfDay(today)),
    games: games.filter(game => {
      const gameDate = new Date(game.eventStartTime);
      return isSameDay(gameDate, currentDay);
    })
    .sort((a, b) => a.eventStartTime - b.eventStartTime)
    .map(game => ({
      ...game,
      time: formatTime(new Date(game.eventStartTime))
    }))
  });
  if (currentWeek.length === 7) {
    nextThreeWeeks.push(currentWeek);
    currentWeek = [];
  }
}

function convertToTableRow(game: Game): {
  isPastGame: boolean;
  teamDisplay: string;
  gameTime: string;
  rink: string;
  score: string;
  team: string;
  day: string;
  time: string;
} {
  const teamDisplay = game.team === "Ice Pack" ? `${game.team} vs. ${game.opponent}` : game.team;
  const isPastGame = game.eventStartTime < Date.now();
  return {
    isPastGame,
    teamDisplay,
    team: game.team,
    gameTime: formatGameTime(game),
    day: format(game.eventStartTime, 'M/d (EEE)'),
    time: format(game.eventStartTime, 'h:mm a'),
    rink: game.rink,
    score: game.score || '-',
  };
}

export const tableRows = games.sort((a, b) => a.eventStartTime - b.eventStartTime)
    .map(convertToTableRow);