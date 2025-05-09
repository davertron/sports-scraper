import { CairnsGame, Game } from "../types.ts";
import { toUTCMillis } from "./formatters.ts";

export async function scrapeDruckermanGames({raw}: {raw?: boolean} = {}): Promise<Game[] | CairnsGame[]> {
  const response = await fetch("https://cairnsarena.finnlyconnect.com/schedule/460");
  const html = await response.text();

  // Extract the JSON data from the script tag
  const allGamesString = html.match(/_onlineScheduleList\s*=\s*(\[.*?\]);/s);
  if (!allGamesString) {
    return [];
  }

  const allGames: CairnsGame[] = JSON.parse(allGamesString[1]);

  if (raw) {
    return allGames
      .filter(game => game.AccountName === "Druckerman");
  }

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
