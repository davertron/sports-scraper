import { CairnsGame, Game } from "../types.ts";
import { toUTCMillis } from "./formatters.ts";

export async function scrapeDruckermanGames({raw}: {raw?: boolean} = {}): Promise<Game[] | CairnsGame[]> {
  // Scrape Cairns games
  const cairnsResponse = await fetch("https://cairnsarena.finnlyconnect.com/schedule/460");
  const cairnsHtml = await cairnsResponse.text();

  // Extract the JSON data from the script tag
  const allGamesString = cairnsHtml.match(/_onlineScheduleList\s*=\s*(\[.*?\]);/s);
  if (!allGamesString) {
    return [];
  }

  const allGames: CairnsGame[] = JSON.parse(allGamesString[1]);

  // Process Cairns games
  const cairnsGames = allGames
    .filter(game => game.AccountName === "Druckerman")
    .map((game: CairnsGame) => ({
      rink: game.FacilityName.replace("Rink", "Cairns"),
      eventStartTime: toUTCMillis(game.EventStartTime),
      eventEndTime: toUTCMillis(game.EventEndTime),
      sourceId: "cairns-" + game.EventId,
      opponent: "",
      score: "",
      team: "Druckerman",
    }));

  // Scrape Essex games
  const essexUrlParams = {
    SiteIds: "12",
    SpaceIds: "0",
    ClassIds: "0",
    GroupIds: "0",
    TypeIds: "0",
    Status: "",
    EventTypeIds: "0",
    FieldIds: "0",
    start: "2025-09-01",
    end: "2026-04-01",
    IsPublic: "1",
    IsRequestCalendar: "false",
    ApprovedOnly: "1",
    ShowDetailsOnly: "1",
    ShowDetailsLink: "1",
    ShowSetupBreakdown: "0",
    HideAlwaysAvailable: "false",
    ShowAllBlockedDates: "false",
    GroupForAllowDoubleBooking: "0",
    SearchTerm: "Howard",
    FilterOption: "1",
    CalendarInformationFilterOption: "0",
    EventDuration: "0",
    _: Date.now().toString(),
  };

  const essexBaseUrl = "https://vt3.mlschedules.com/Service/SMSwcf.svc/GetEventsFormattedMultiSelect";
  const essexQueryString = new URLSearchParams(essexUrlParams).toString();
  const essexFullUrl = `${essexBaseUrl}?${essexQueryString}`;

  const essexResponse = await fetch(essexFullUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  const essexData = await essexResponse.json();

  if (raw) {
    return [...allGames
      .filter(game => game.AccountName === "Druckerman"), ...essexData];
  }


  // Process Essex games
  const essexGames: Game[] = [];
  if (essexData && Array.isArray(essexData)) {
    essexData.forEach(event => {
      essexGames.push({
        rink: "Essex",
        eventStartTime: toUTCMillis(event.start),
        eventEndTime: toUTCMillis(event.end),
        sourceId: "essex-" + event.id,
        opponent: "",
        score: "",
        team: "Druckerman",
      });
    });
  }

  // Combine and sort all games
  const allDruckermanGames = [...cairnsGames, ...essexGames]
    // @ts-ignore TODO: Not sure why it's complaining about date arithmetic...
    .sort((a, b) => a.eventStartTime - b.eventStartTime);

  return allDruckermanGames;
}
