import * as cheerio from "cheerio";
import type { Game } from "../types.ts";
import { monthNameToNumber, to24Hour, zonedMillis } from "./formatters.ts";

const FULL_STRIDE_URL = "https://fullstridestaging.com/schedule_nf.php?league=1&programme_abbr=SDU";

// The dates look like this: Jan 14 (Tue)9:50 pm
// Cancelled games have "CANCELLED" jammed into the same cell, e.g.
// "Jul 20 (Mon)9:50 pmCANCELLED" -- strip it out and surface it separately
// rather than letting it break date parsing.
const CANCELLED_PATTERN = /cancelled/i;
const DATE_PATTERN = /^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{1,2}):(\d{2})\s*([ap]m)\s+(\d{4})$/i;

function parseDate(dateString: string): { startTime: number; cancelled: boolean } {
  const cancelled = CANCELLED_PATTERN.test(dateString);
  // Strip out the day of week part (i.e. Mon) and any cancellation marker to simplify parsing
  const cleaned = (
    dateString.replace(/\s*\([^)]+\)/, " ").replace(CANCELLED_PATTERN, "") +
    " " + (new Date().getFullYear())
  ).trim();
  const match = cleaned.match(DATE_PATTERN);
  if (!match) {
    throw new Error(`Unable to parse Ice Pack game date: "${cleaned}"`);
  }
  const [, monthName, day, hour12, minute, meridiem, year] = match;

  const startTime = zonedMillis({
    year: Number(year),
    month: monthNameToNumber(monthName),
    day: Number(day),
    hour: to24Hour(Number(hour12), meridiem),
    minute: Number(minute),
  });

  return { startTime, cancelled };
}

export async function scrapeIcePackGames(): Promise<Game[]> {
  const response = await fetch(FULL_STRIDE_URL);
  const html = await response.text();

  const allGames: Game[] = [];

  const $ = cheerio.load(html);

  const $scheduleRows = $(
    "body > font > table > tbody > tr:nth-child(4) > td > table > tbody > tr",
  );

  $scheduleRows.each((index: number, row) => {
    if (index !== 0) {
      const tds = $(row).find("td");
      const firstTeam = $(tds[3]).find("tr:nth-child(1) td:nth-child(1) font").text();
      const secondTeam = $(tds[3]).find("tr:nth-child(2) td:nth-child(1) font").text();
      const isIcePackGame = firstTeam === "Ice Pack" || secondTeam === "Ice Pack";
      if (!isIcePackGame) {
        return;
      }
      const firstScore = $(tds[3]).find("tr:nth-child(1) td:nth-child(2) font").text().trim();
      const secondScore = $(tds[3]).find("tr:nth-child(2) td:nth-child(2) font").text().trim();
      const grossStartTime = $(tds[0]).text();
      const { startTime, cancelled } = parseDate(grossStartTime);
      const endTime = startTime + 60 * 60 * 1000; // Just add an hour to startTime
      const opponent = firstTeam === "Ice Pack" ? secondTeam : firstTeam;
      // Always put Ice Pack score first
      const score = firstTeam === "Ice Pack" ? `${firstScore} - ${secondScore}` : `${secondScore} - ${firstScore}`;
      const gameNum = $(tds[2]).text();
      //  (rink, team, start_time, end_time, opponent, score, source_id)
      const game = {
        eventStartTime: startTime,
        eventEndTime: endTime,
        rink: $(tds[1]).text().replace(/Cairns - (\d)/, "Cairns $1"),
        opponent,
        score,
        team: "Ice Pack",
        sourceId: `icepack-${gameNum}`,
        cancelled,
      };
      allGames.push(game);
    }
  });

  return allGames;
}