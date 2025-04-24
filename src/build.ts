import { scrapeDruckermanGames } from "./scrapeDruckermanGames.ts";
import { scrapeIcePackGames } from "./scrapeIcePackGames.ts";

const [dGames, iGames] = await Promise.all([scrapeDruckermanGames(), scrapeIcePackGames()]);
const hockeySchedule = [
  ...dGames,
  ...iGames,
];

try {
  await Deno.stat("public/data");
} catch (e) {
  if (e instanceof Deno.errors.NotFound) {
    await Deno.mkdir("public/data", { recursive: true });
  } else {
    throw e;
  }
}

// Write scraped data to a JSON file
await Deno.writeTextFile("public/data/schedule.json", JSON.stringify(hockeySchedule, null, 2));

// TODO: This seems very roundabout...We should load the index.html file,
// then insert the schedule into the div with id="schedule" instead at build time.
// Generate a JavaScript file to load the schedule dynamically
const jsContent = `
  fetch('./data/schedule.json')
    .then(response => response.json())
    .then(data => {
      const scheduleDiv = document.getElementById('schedule');
      scheduleDiv.innerHTML = data.map(game => \`<p>\${game.rink}: \${game.title}</p>\`).join('');
    });
`;
await Deno.writeTextFile("public/schedule.js", jsContent);

console.log("Site built successfully!");
