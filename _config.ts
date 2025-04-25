import lume from "lume/mod.ts";

const site = lume({
  location: new URL("https://davertron.github.io/sports-scraper/"),
});

site.copy("static");

export default site;
