import { scrapeDruckermanGames } from "./utils/scrapeDruckermanGames.ts";
import { scrapeIcePackGames } from "./utils/scrapeIcePackGames.ts";
import { uploadToS3 } from "./utils/s3.ts";
import { scrapeBigFatNerdsGames } from "./utils/scrapeBigFatNerdsGames.ts";
import { encodeHex } from "jsr:@std/encoding/hex";

async function main() {
  try {
    console.log("Starting hockey data scrape...");
    const [dGames, iGames, bfngGames] = await Promise.all([
      scrapeDruckermanGames(),
      scrapeIcePackGames(),
      scrapeBigFatNerdsGames(),
    ]);
    const games = [...dGames, ...iGames, ...bfngGames];
    console.log(`Successfully scraped ${games.length} games`);

    console.log("Games:", games);

    const dataString = JSON.stringify(games);
    const messageBuffer = new TextEncoder().encode(dataString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer);
    const hash = encodeHex(hashBuffer);
    console.log(`Calculated hash: ${hash}`);
    // TODO: Might be good to put this somewhere else since they aren't all
    // hockey games...
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