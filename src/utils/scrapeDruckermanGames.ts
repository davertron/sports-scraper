import type { CairnsGame, Game } from "../types.ts";
import { toUTCMillis } from "./formatters.ts";
import { fetchWithRetry } from "./fetchWithRetry.ts";

export async function scrapeDruckermanGames({raw}: {raw?: boolean} = {}): Promise<Game[] | CairnsGame[]> {
  // Scrape Cairns games
  const cairnsResponse = await fetchWithRetry("https://cairnsarena.finnlyconnect.com/schedule/460");
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
  // GOTCHA (see README "Known Gotchas"): this used to be a hardcoded
  // start/end date range for "this season", which silently went stale once
  // the season it named ended -- Essex games stopped showing up anywhere
  // (site or calendar) with no error, while Cairns kept working since its
  // scrape isn't date-bounded. Fixed by computing the window below instead
  // of hardcoding it, so it should no longer need a yearly manual bump --
  // but if Essex games ever go missing again, check this first.
  //
  // Query the full current hockey season (Sept-April) rather than a fixed
  // date range, so this doesn't need manual updates every year. The window
  // is anchored to the season's *start*, not to "today", because the result
  // of this fetch entirely replaces the stored data set each run (see
  // scrapeAndUpload.ts) -- a window that rolls forward relative to today
  // would drop early-season games (and their scores) once they age out of
  // it, even though the season isn't over yet.
  const today = Temporal.Now.plainDateISO("America/New_York");
  // Season flips from "last" to "next" in July, ahead of the September
  // start, since rinks often publish the upcoming season's schedule in
  // August.
  const seasonStartYear = today.month >= 7 ? today.year : today.year - 1;
  const seasonStart = Temporal.PlainDate.from({ year: seasonStartYear, month: 9, day: 1 });
  const seasonEnd = Temporal.PlainDate.from({ year: seasonStartYear + 1, month: 4, day: 1 });
  const essexUrlParams = {
    SiteIds: "12",
    SpaceIds: "0",
    ClassIds: "0",
    GroupIds: "0",
    TypeIds: "0",
    Status: "",
    EventTypeIds: "0",
    FieldIds: "0",
    start: seasonStart.toString(),
    end: seasonEnd.toString(),
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

  const essexResponse = await fetchWithRetry(essexFullUrl, {
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
