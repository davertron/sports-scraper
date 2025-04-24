import { scrapeDruckermanGames } from "./scrapeDruckermanGames.ts";
import { scrapeIcePackGames } from "./scrapeIcePackGames.ts";

const [dGames, iGames] = await Promise.all([scrapeDruckermanGames(), scrapeIcePackGames()]);
const hockeySchedule = [
  ...dGames,
  ...iGames,
];

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
const scheduleHtml = hockeySchedule
  .map(game => `<p>${game.team}: ${game.eventStartTime} ${game.opponent} ${game.score}</p>`)
  .join('');

// Replace the schedule div content with the generated HTML
const finalHtml = templateHtml.replace(
  '<div id="schedule"></div>',
  `<div id="schedule">${scheduleHtml}</div>`
);

// Write the final HTML file
await Deno.writeTextFile("public/index.html", finalHtml);

console.log("Site built successfully!");
