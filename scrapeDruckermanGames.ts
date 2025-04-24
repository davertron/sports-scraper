import { DateTime } from "https://esm.sh/luxon@3.6.1";

type Game = {
  AccountName: string;
  EventStartTime: string;
  EventEndTime: string;
  FacilityName: string;
  title: string;
  EventId: string;
};

// Just print mm/dd/YY
function formatDate(dateMillis: number) {
  const date = new Date(dateMillis);
  const options = { year: "2-digit", month: "2-digit", day: "2-digit" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

// Parse date from "2025-04-11T06:40:00" using luxon.DateTime
function toUTCMillis(dateString: string) {
  const dt = DateTime.fromISO(dateString, {
    zone: "America/New_York", // interpret input as being in this zone
  });
  return dt.toMillis();
}

export async function scrapeDruckermanGames() {
  const response = await fetch("https://cairnsarena.finnlyconnect.com/schedule/460");
  const html = await response.text();

  // Extract the JSON data from the script tag
  const allGamesString = html.match(/_onlineScheduleList\s*=\s*(\[.*?\]);/s);
  if (!allGamesString) {
    return [];
  }

  const allGames: Game[] = JSON.parse(allGamesString[1]);
  // console.log(allGames.slice(0, 10));
  const druckermanGames = allGames
    .filter(game => game.AccountName === "Druckerman")
    .map((game: Game) => ({
      title: game.title,
      rink: game.FacilityName.replace("Rink", "Cairns"),
      eventStartTime: toUTCMillis(game.EventStartTime),
      eventEndTime: toUTCMillis(game.EventEndTime),
      eventId: game.EventId,
    }))
    // @ts-ignore TODO: Not sure why it's complaining about date arithmetic...
    .sort((a, b) => a.eventStartTime - b.eventStartTime);

  console.log(druckermanGames);

  return druckermanGames;
}
