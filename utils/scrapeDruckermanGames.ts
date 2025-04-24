import { DateTime } from "https://esm.sh/luxon@3.6.1";
import { CairnsGame, Game } from "../types.ts";

// Parse date from "2025-04-11T06:40:00" using luxon.DateTime
function toUTCMillis(dateString: string) {
  const dt = DateTime.fromISO(dateString, {
    zone: "America/New_York", // interpret input as being in this zone
  });
  return dt.toMillis();
}

export async function scrapeDruckermanGames(): Promise<Game[]> {
  const response = await fetch("https://cairnsarena.finnlyconnect.com/schedule/460");
  const html = await response.text();

  // Extract the JSON data from the script tag
  const allGamesString = html.match(/_onlineScheduleList\s*=\s*(\[.*?\]);/s);
  if (!allGamesString) {
    return [];
  }

  const allGames: CairnsGame[] = JSON.parse(allGamesString[1]);
  const druckermanGames = allGames
    .filter(game => game.AccountName === "Druckerman")
    .map((game: CairnsGame) => ({
      rink: game.FacilityName.replace("Rink", "Cairns"),
      eventStartTime: toUTCMillis(game.EventStartTime),
      eventEndTime: toUTCMillis(game.EventEndTime),
      sourceId: game.EventId,
      opponent: "",
      score: "",
      team: "Druckerman",
    }))
    // @ts-ignore TODO: Not sure why it's complaining about date arithmetic...
    .sort((a, b) => a.eventStartTime - b.eventStartTime);

  return druckermanGames;
}
