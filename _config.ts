import lume from "lume/mod.ts";

const site = lume();

site.copy("static");
site.ignore("frontend");

export default site;
