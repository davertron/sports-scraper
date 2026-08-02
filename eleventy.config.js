export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ static: "static" });
  // Browsers auto-request /favicon.ico at the site root regardless of any
  // <link rel="icon"> tag, so it needs to live there, not under /static/.
  eleventyConfig.addPassthroughCopy({ "static/favicon.ico": "favicon.ico" });
  eleventyConfig.addGlobalData("buildTime", () => new Date());

  return {
    dir: {
      input: "src/pages",
      output: "_site",
      includes: "_includes",
    },
  };
}
