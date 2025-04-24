// Replace this with your scraping logic
const hockeySchedule = [
  { date: "2023-11-01", team: "Team A vs Team B" },
  { date: "2023-11-02", team: "Team C vs Team D" },
];

// Write scraped data to a JSON file
await Deno.writeTextFile("public/data/schedule.json", JSON.stringify(hockeySchedule, null, 2));

// Generate a JavaScript file to load the schedule dynamically
const jsContent = `
  fetch('./data/schedule.json')
    .then(response => response.json())
    .then(data => {
      const scheduleDiv = document.getElementById('schedule');
      scheduleDiv.innerHTML = data.map(game => \`<p>\${game.date}: \${game.team}</p>\`).join('');
    });
`;
await Deno.writeTextFile("public/schedule.js", jsContent);

console.log("Site built successfully!");
