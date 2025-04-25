import { scrapeDruckermanGames } from "./utils/scrapeDruckermanGames.ts";
import { scrapeIcePackGames } from "./utils/scrapeIcePackGames.ts";
import { uploadToS3 } from "./utils/s3.ts";
import { createHash } from "node:crypto";

async function main() {
  try {
    console.log("Starting hockey data scrape...");
    const [dGames, iGames] = await Promise.all([
      scrapeDruckermanGames(),
      scrapeIcePackGames()
    ]);
    const games = [...dGames, ...iGames];
    console.log(`Successfully scraped ${games.length} games`);

    const dataString = JSON.stringify(games);
    const hash = createHash("sha256").update(dataString).digest("hex");
    const key = `hockey-games/${hash}.json`;
    
    const uploaded = await uploadToS3(games, key);
    if (uploaded) {
      console.log("Successfully uploaded new data to S3");
    } else {
      console.log("Data unchanged, no upload needed");
    }
  } catch (error) {
    console.error("Error in scrape and upload process:", error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
} 