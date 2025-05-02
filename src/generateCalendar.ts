import { Game } from "./types.ts";
import { uploadCalendarToS3 } from "./utils/s3.ts";

function generateICS(calendarName: string, games: Game[]): string {
  const now = new Date();
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hockey Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarName}`,
    "X-WR-TIMEZONE:America/New_York",
  ];

  for (const game of games) {
    const startDate = new Date(game.eventStartTime);
    const endDate = new Date(game.eventEndTime);
    
    // Format dates in ICS format
    const formatDate = (date: Date) => {
      return date.toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    };

    // Customize summary based on team type
    const summary = game.team === "Ice Pack" 
      ? `🏒 ${game.rink} - ${game.team} vs ${game.opponent || 'TBD'}`
      : `🏒 ${game.rink} - ${game.team} Skate`;

    const event = [
      "BEGIN:VEVENT",
      `DTSTAMP:${formatDate(now)}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${game.score ? `Score: ${game.score}` : ''}`,
      "END:VEVENT",
    ];

    calendar.push(...event);
  }

  calendar.push("END:VCALENDAR");
  return calendar.join("\r\n");
}

async function main() {
  try {
    console.log("Fetching hockey games data...");
    const response = await fetch("https://d1msdfi79mlr9u.cloudfront.net/hockey-games/latest.json");
    const games = await response.json() as Game[];
    
    console.log(`Generating calendar for ${games.length} games...`);
    const icsContent = generateICS("Hockey Schedule", games);
    
    // Use a stable filename for the calendar
    const key = "hockey-calendar/schedule.ics";
    
    console.log("Uploading calendar to S3...");
    const uploaded = await uploadCalendarToS3(icsContent, key);
    
    if (uploaded) {
      console.log("Successfully uploaded new calendar to S3");
    } else {
      console.log("Calendar unchanged, no upload needed");
    }

    // Split the games into two calendars for sharing with 
    // the ice pack and druckerman groups
    const icePackGames = games.filter(game => game.team === "Ice Pack");
    const druckermanGames = games.filter(game => game.team === "Druckerman");

    const icePackCalendar = generateICS("Ice Pack Schedule", icePackGames);
    const druckermanCalendar = generateICS("Druckerman Schedule", druckermanGames);

    const icePackKey = "hockey-calendar/ice-pack-schedule.ics";
    const druckermanKey = "hockey-calendar/druckerman-schedule.ics";

    const icePackUploaded = await uploadCalendarToS3(icePackCalendar, icePackKey);
    const druckermanUploaded = await uploadCalendarToS3(druckermanCalendar, druckermanKey); 
    
    if (icePackUploaded) {
      console.log("Successfully uploaded new ice pack calendar to S3");
    } else {
      console.log("Ice pack calendar unchanged, no upload needed");
    }
    
    if (druckermanUploaded) {
      console.log("Successfully uploaded new druckerman calendar to S3");
    } else {
      console.log("Druckerman calendar unchanged, no upload needed");
    }
  } catch (error) {
    console.error("Error in calendar generation process:", error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
} 