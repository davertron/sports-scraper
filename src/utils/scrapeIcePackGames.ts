import * as cheerio from "cheerio";
import { DateTime } from "luxon";
import { Game } from "../types.ts";

const FULL_STRIDE_URL = "https://fullstridestaging.com/schedule_nf.php?league=1&programme_abbr=SRD";

// The dates look like this: Jan 14 (Tue)9:50 pm
function parseDate(dateString: string) {
  // Strip out the day of week part (i.e. Mon) to simplify parsing
  const cleaned = (dateString.replace(/\s*\([^)]+\)/, " ") + " " + (new Date().getFullYear())).trim();
  const dt = DateTime.fromFormat(cleaned, "LLL d h:mm a yyyy", {
    zone: "America/New_York",
  });

  return dt.toMillis();
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
      const startTime = parseDate(grossStartTime);
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
      };
      allGames.push(game);
    }
  });

  return allGames;
}