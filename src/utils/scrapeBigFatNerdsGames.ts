import { DateTime } from "https://esm.sh/luxon@3.6.1";
import { Game } from "../types.ts";

// My copy: https://docs.google.com/spreadsheets/d/1JkeOGc9uHVgrP399IL-4oQEOZk-SPX9Fs-Iq_fNj0Z0/edit?gid=0#gid=0
// Original: https://docs.google.com/spreadsheets/d/1EhqIlq7-gLTzTDCn-7gmk8eWqEEEHZfFK3-2-LFu5NU/edit?gid=1340605254#gid=1340605254
async function fetchGoogleSheetsData(): Promise<string> {
  // The sheet ID is the long string in the URL between /d/ and /edit
  const sheetId = "1EhqIlq7-gLTzTDCn-7gmk8eWqEEEHZfFK3-2-LFu5NU";
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=tsv`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Google Sheets data: ${response.statusText}`);
  }
  
  return await response.text();
}

function isDateLine(line: string): boolean {
  // Matches lines like "Wednesday, May 7, 2025"
  return /\w+, \w+ \d{1,2}, \d{4}/.test(line.trim());
}

function isGameLine(line: string): boolean {
  // Matches lines that start with a time (e.g., "6:00 PM")
  return /^\d{1,2}:\d{2} [AP]M/.test(line.trim());
}

export async function scrapeBigFatNerdsGames(): Promise<Game[]> {
  const tsvData = await fetchGoogleSheetsData();
  const lines = tsvData.split('\n');
  let currentDate = null;
  const games: Game[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (isDateLine(trimmed)) {
      currentDate = trimmed;
      continue;
    }
    if (isGameLine(trimmed) && currentDate) {
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
      games.push({
        eventStartTime,
        eventEndTime,
        opponent,
        team: "Big Fat Nerds",
        rink: field,
        score: '',
        sourceId: `bigfatnerds-${eventStartTime}`,
      });
    }
  }
  return games;
}

// Add this to run the scraper directly
if (import.meta.main) {
  scrapeBigFatNerdsGames().then(games => console.log(games)).catch(console.error);
}