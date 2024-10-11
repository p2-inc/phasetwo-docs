module.exports = function (context, options) {
  return {
    name: "postcss-tailwindcss-loader",
    // https://github.com/facebook/docusaurus/issues/2961#issuecomment-1531243979
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: "link",
            attributes: {
              rel: "stylesheet",
              href: "https://cdn.jsdelivr.net/npm/tailwindcss/dist/preflight.min.css",
            },
          },
        ],
      };
    },
    configurePostCss(postcssOptions) {
      // https://github.com/facebook/docusaurus/issues/2961#issuecomment-1531243979
      postcssOptions.plugins.push(require("tailwindcss"));
      postcssOptions.plugins.push(require("autoprefixer"));
      return postcssOptions;
    },
  };
};
