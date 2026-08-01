export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ static: "static" });
  eleventyConfig.addGlobalData("buildTime", () => new Date());

  return {
    dir: {
      input: "src/pages",
      output: "_site",
      includes: "_includes",
    },
  };
}
