import lume from "lume/mod.ts";

const site = lume({
  location: new URL("https://davertron.github.io/sports-scraper/"),
  prettyUrls: false, // These don't work on GitHub Pages
});

site.copy("static");

export default site;
