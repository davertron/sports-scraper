import { DateTime } from "luxon";
import { Game } from "../types.ts";

// Schedule: https://docs.google.com/spreadsheets/d/1EhqIlq7-gLTzTDCn-7gmk8eWqEEEHZfFK3-2-LFu5NU/edit?gid=0#gid=0
// Results: https://docs.google.com/spreadsheets/d/1EhqIlq7-gLTzTDCn-7gmk8eWqEEEHZfFK3-2-LFu5NU/edit?gid=520016829#gid=520016829
const SHEET_ID = "1EhqIlq7-gLTzTDCn-7gmk8eWqEEEHZfFK3-2-LFu5NU";
const SCHEDULE_GID = "0";
const RESULTS_GID = "520016829";

async function fetchSheetTab(gid: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=tsv&gid=${gid}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Google Sheets data: ${response.statusText}`);
  }
  return await response.text();
}

function isMatchdayLine(line: string): boolean {
  return /^Matchday \d+/i.test(line.trim());
}

function isDateLine(line: string): boolean {
  // Matches lines like "Wednesday, May 7, 2025"
  return /\w+, \w+ \d{1,2}, \d{4}/.test(line.trim());
}

function isGameLine(line: string): boolean {
  // Matches lines that start with a time (e.g., "6:00 PM")
  return /^\d{1,2}:\d{2} [AP]M/.test(line.trim());
}

function isResultGameLine(line: string): boolean {
  // e.g. "Big Fat Nerds\t1\t2\tYe Olde Northenders"
  return /\t\d+\t\d+\t/.test(line);
}

function parseResults(tsv: string) {
  const lines = tsv.split('\n');
  let currentMatchday = '';
  const results: Record<string, {home: string, away: string, homeScore: string, awayScore: string}> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (isMatchdayLine(trimmed)) {
      currentMatchday = trimmed;
      continue;
    }
    if (isResultGameLine(trimmed) && currentMatchday) {
      const parts = trimmed.split(/\t|\s{2,}/).filter(Boolean);
      if (parts.length < 4) continue;
      const [homeTeam, homeScore, awayScore, awayTeam] = parts;
      const key = `${currentMatchday}__${homeTeam}__${awayTeam}`;
      results[key] = {home: homeTeam, away: awayTeam, homeScore, awayScore};
    }
  }
  return results;
}

export async function scrapeBigFatNerdsGames(): Promise<Game[]> {
  const [scheduleTsv, resultsTsv] = await Promise.all([
    fetchSheetTab(SCHEDULE_GID),
    fetchSheetTab(RESULTS_GID)
  ]);

  // Debug: print first 20 lines of each TSV
  const scheduleLines = scheduleTsv.split('\n');
  //const resultsLines = resultsTsv.split('\n');
  //console.log('First 20 lines of SCHEDULE TSV:\n', scheduleLines.slice(0, 20).join('\n'));
  //console.log('First 20 lines of RESULTS TSV:\n', resultsLines.slice(0, 20).join('\n'));

  const results = parseResults(resultsTsv);
  let currentDate = null;
  let currentMatchday = '';
  const games: Game[] = [];

  for (const line of scheduleLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (isMatchdayLine(trimmed)) {
      currentMatchday = trimmed;
      continue;
    }
    if (isDateLine(trimmed)) {
      //console.log('Detected date line:', trimmed);
      currentDate = trimmed;
      continue;
    }
    if (isGameLine(trimmed) && currentDate && currentMatchday) {
      //console.log('Detected game line:', trimmed);
      // Split by tab or multiple spaces (since Google Sheets export can be inconsistent)
      const parts = trimmed.split(/\t|\s{2,}/).filter(Boolean);
      // Expect: [time, home, 'vs', away, field]
      if (parts.length < 5) continue;
      const [time, homeTeam, , awayTeam, field] = parts;
      if (homeTeam !== "Big Fat Nerds" && awayTeam !== "Big Fat Nerds") continue;
      // Parse date and time
      const dt = DateTime.fromFormat(`${currentDate} ${time}`, "EEEE, MMMM d, yyyy h:mm a", {
        zone: "America/New_York"
      });
      const eventStartTime = dt.toMillis();
      const eventEndTime = eventStartTime + 60 * 60 * 1000;
      const opponent = homeTeam === "Big Fat Nerds" ? awayTeam : homeTeam;
      // Use matchday+teams as key
      let score = '';
      const resultKey = `${currentMatchday}__${homeTeam}__${awayTeam}`;
      const revResultKey = `${currentMatchday}__${awayTeam}__${homeTeam}`;
      if (results[resultKey]) {
        const {homeScore, awayScore} = results[resultKey];
        score = homeTeam === "Big Fat Nerds" ? `${homeScore} - ${awayScore}` : `${awayScore} - ${homeScore}`;
      } else if (results[revResultKey]) {
        const {homeScore, awayScore} = results[revResultKey];
        score = awayTeam === "Big Fat Nerds" ? `${awayScore} - ${homeScore}` : `${homeScore} - ${awayScore}`;
      }
      games.push({
        eventStartTime,
        eventEndTime,
        opponent,
        team: "Big Fat Nerds",
        rink: field,
        score,
        sourceId: `bigfatnerds-${eventStartTime}`,
      });
    }
  }
  return games;
}

// Add this to run the scraper directly
if (import.meta.main) {
  scrapeBigFatNerdsGames().then(games => console.log('Final games array:', games)).catch(console.error);
}