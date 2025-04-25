import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";

const site = lume({
  location: new URL("https://davertron.github.io/sports-scraper/"),
  prettyUrls: false, // These don't work on GitHub Pages
});

site.copy("static");
site.use(basePath());

export default site;
