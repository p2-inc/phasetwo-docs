// sidebars.guides.js

module.exports = {
  guides: [
    {
      type: "category",
      label: "Cat A",
      link: {
        type: "doc",
        id: "index", // resolves to guides/index.md
      },
      items: ["oidc-configuration", "oidc-configuration-2"], // resolves to guides/oidc-configuration.md, etc
    },
    // {
    //   type: "category",
    //   label: "Cat B",
    //   items: ["foo"], // resolves to guides/foo.md
    // },
  ],
};
