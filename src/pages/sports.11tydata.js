import { formatGameTime, formatTime } from "../utils/formatters.ts";
import { overrideGames } from "../utils/overrideGames.ts";

// 'M/d (EEE)' style label, e.g. "5/7 (Wed)" -- matches the old date-fns-tz
// formatInTimeZone(ts, 'America/New_York', 'M/d (EEE)') output.
function formatDayLabel(timestampMs) {
  const date = new Date(timestampMs);
  const month = date.toLocaleString("en-US", { month: "numeric", timeZone: "America/New_York" });
  const day = date.toLocaleString("en-US", { day: "numeric", timeZone: "America/New_York" });
  const weekday = date.toLocaleString("en-US", { weekday: "short", timeZone: "America/New_York" });
  return `${month}/${day} (${weekday})`;
}

function gameDate(timestampMs) {
  return Temporal.Instant.fromEpochMilliseconds(timestampMs)
    .toZonedDateTimeISO("America/New_York")
    .toPlainDate();
}

// CSS class-safe team slug, e.g. "Big Fat Nerds" -> "big-fat-nerds". Computed
// here rather than in the template so the template only does property access.
function teamClass(team) {
  return team.replace(/\s+/g, "-").toLowerCase();
}

function convertToTableRow(game) {
  if (!game.eventStartTime || !game.eventEndTime) {
    console.debug(`Game is missing eventStartTime or eventEndTime: `, game);
    return null;
  }

  const teamDisplay = game.team === "Ice Pack" ? `${game.team} vs. ${game.opponent}` : game.team;

  return {
    isPastGame: game.eventStartTime < Date.now(),
    teamDisplay,
    team: game.team,
    teamClass: teamClass(game.team),
    gameTime: formatGameTime(game),
    day: formatDayLabel(game.eventStartTime),
    time: formatTime(new Date(game.eventStartTime)),
    rink: game.rink,
    score: game.score || "-",
    cancelled: game.cancelled || false,
  };
}

export default async function () {
  const response = await fetch("https://d1msdfi79mlr9u.cloudfront.net/hockey-games/latest.json");
  const games = overrideGames(await response.json());

  // Let's generate a calendar view for this week and the following two weeks.
  // Each week starts on Sunday and ends on Saturday.
  const today = Temporal.Now.plainDateISO("America/New_York");
  // Temporal's dayOfWeek is 1 (Monday) - 7 (Sunday); walk back to the most
  // recent Sunday (0 days back if today already is Sunday).
  const daysSinceSunday = today.dayOfWeek === 7 ? 0 : today.dayOfWeek;
  const startOfWeekDate = today.subtract({ days: daysSinceSunday });

  const nextThreeWeeks = [];
  let currentWeek = [];

  for (let i = 0; i < 21; i++) { // 3 weeks * 7 days = 21
    const currentDay = startOfWeekDate.add({ days: i });
    currentWeek.push({
      dayOfMonth: currentDay.toLocaleString("en-US", { day: "numeric" }),
      isToday: currentDay.equals(today),
      isPast: Temporal.PlainDate.compare(currentDay, today) < 0,
      games: games
        .filter((game) => gameDate(game.eventStartTime).equals(currentDay))
        .sort((a, b) => a.eventStartTime - b.eventStartTime)
        .map((game) => ({
          ...game,
          teamClass: teamClass(game.team),
          time: formatTime(new Date(game.eventStartTime)),
        })),
    });
    if (currentWeek.length === 7) {
      nextThreeWeeks.push(currentWeek);
      currentWeek = [];
    }
  }

  const tableRows = games
    .sort((a, b) => a.eventStartTime - b.eventStartTime)
    .map(convertToTableRow)
    .filter(Boolean);

  const teams = [...new Set(games.map((game) => game.team))];

  return { nextThreeWeeks, tableRows, teams };
}
