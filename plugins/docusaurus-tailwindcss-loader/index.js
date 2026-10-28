module.exports = function (context, options) {
  return {
    name: "postcss-tailwindcss-loader",
    // https://github.com/facebook/docusaurus/issues/2961#issuecomment-1531243979
    injectHtmlTags() {
      return {
        headTags: [
          // Served from static/ rather than the CDN: the unpinned CDN URL
          // resolved to tailwindcss@1.0.2, so that exact file is vendored to
          // keep the cascade unchanged, without a third-party origin in the
          // render-blocking path.
          {
            tagName: "link",
            attributes: {
              rel: "stylesheet",
              href: `${context.baseUrl}css/tailwind-preflight-1.0.2.min.css`,
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
