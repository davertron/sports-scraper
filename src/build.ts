import { scrapeDruckermanGames } from "./scrapeDruckermanGames.ts";
import { scrapeIcePackGames } from "./scrapeIcePackGames.ts";
import { Game } from "./types.ts";

function formatTime(hours: number, minutes: number): string {
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes.toString().padStart(2, '0')}${ampm}`;
}

function formatIcePackTime(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${month}/${day} ${formatTime(hours, minutes)}`;
}

function formatDateRange(startTime: number, endTime: number): string {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const month = startDate.getMonth() + 1;
  const day = startDate.getDate();
  
  const startHours = startDate.getHours();
  const startMinutes = startDate.getMinutes();
  const endHours = endDate.getHours();
  const endMinutes = endDate.getMinutes();
  
  return `${month}/${day} ${formatTime(startHours, startMinutes)} - ${formatTime(endHours, endMinutes)}`;
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

const scheduleHtml = `${nextIcePackGameHtml}${nextDruckermanGameHtml}\n<h2>Full Schedule</h2>\n${fullScheduleTable}`;
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
