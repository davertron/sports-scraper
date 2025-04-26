import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";

const site = lume();

site.copy("static");
site.use(basePath());

export default site;
