import { scrapeDruckermanGames } from "./scrapeDruckermanGames.ts";
import { scrapeIcePackGames } from "./scrapeIcePackGames.ts";
import { Game } from "./types.ts";

function formatTime(date: Date): string {
  return date.toLocaleString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });
}

function formatIcePackTime(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.toLocaleString('en-US', { month: 'numeric', timeZone: 'America/New_York' });
  const day = date.toLocaleString('en-US', { day: 'numeric', timeZone: 'America/New_York' });
  return `${month}/${day} ${formatTime(date)}`;
}

function formatDateRange(startTime: number, endTime: number): string {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const month = startDate.toLocaleString('en-US', { month: 'numeric', timeZone: 'America/New_York' });
  const day = startDate.toLocaleString('en-US', { day: 'numeric', timeZone: 'America/New_York' });
  
  return `${month}/${day} ${formatTime(startDate)} - ${formatTime(endDate)}`;
}

function formatIcePackGame(game: Game): string {
  return `${game.team} vs ${game.opponent} at ${formatIcePackTime(game.eventStartTime)}, ${game.rink}`;
}

function formatDruckermanGame(game: Game): string {
  return `${formatDateRange(game.eventStartTime, game.eventEndTime)}, ${game.rink}`;
}

function formatGameTime(game: Game): string {
  return game.team === "Ice Pack" 
    ? formatIcePackTime(game.eventStartTime)
    : formatDateRange(game.eventStartTime, game.eventEndTime);
}

function formatTableRow(game: Game): string {
  const teamDisplay = game.team === "Ice Pack" ? `${game.team} vs. ${game.opponent}` : game.team;
  const isPastGame = game.eventStartTime < Date.now();
  return `<tr${isPastGame ? ' class="past-game"' : ''}>
    <td>${teamDisplay}</td>
    <td>${formatGameTime(game)}</td>
    <td>${game.rink}</td>
    <td>${game.score || '-'}</td>
  </tr>`;
}

const [dGames, iGames] = await Promise.all([scrapeDruckermanGames(), scrapeIcePackGames()]);

// Get the next ice pack game based on the current date and eventStartTime
const nextIcePackGame = iGames.find(game => game.eventStartTime > Date.now());
const nextDruckermanGame = dGames.find(game => game.eventStartTime > Date.now());

try {
  await Deno.stat("public");
} catch (e) {
  if (e instanceof Deno.errors.NotFound) {
    await Deno.mkdir("public", { recursive: true });
  } else {
    throw e;
  }
}

// Read the template HTML file
const templateHtml = await Deno.readTextFile("src/index.template.html");

// Generate the schedule HTML
const nextIcePackGameHtml = nextIcePackGame ? `<p>Next Ice Pack Game: ${formatIcePackGame(nextIcePackGame)}</p>` : "Next Ice Pack Game: None";
const nextDruckermanGameHtml = nextDruckermanGame ? `<p>Next Druckerman Game: ${formatDruckermanGame(nextDruckermanGame)}</p>` : "Next Druckerman Game: None";

const fullScheduleTable = `
<table>
  <thead>
    <tr>
      <th>Team</th>
      <th>Date & Time</th>
      <th>Rink</th>
      <th>Score</th>
    </tr>
  </thead>
  <tbody>
    ${[...iGames, ...dGames]
      .sort((a, b) => a.eventStartTime - b.eventStartTime)
      .map(formatTableRow)
      .join('\n')}
  </tbody>
</table>`;

const lastUpdated = new Date().toLocaleString('en-US', { 
  dateStyle: 'medium', 
  timeStyle: 'short',
  timeZone: 'America/New_York'
});

const scheduleHtml = `${nextIcePackGameHtml}${nextDruckermanGameHtml}
<h2>Full Schedule</h2>
${fullScheduleTable}
<div class="last-updated">Last updated: ${lastUpdated}</div>`;

// Replace the schedule div content with the generated HTML
const finalHtml = templateHtml.replace(
  '<div id="schedule"></div>',
  `<div id="schedule">${scheduleHtml}</div>`
);

// Write the final HTML file
await Deno.writeTextFile("public/index.html", finalHtml);

// Copy the CSS file to public directory
await Deno.copyFile("src/styles.css", "public/styles.css");

console.log("Site built successfully!");
