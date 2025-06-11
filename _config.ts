import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";

const site = lume();

// Add PostCSS plugin
site.use(tailwindcss());
site.use(postcss());

site.add("static/styles.css");

site.copy("static");
site.ignore("frontend");

export default site;
