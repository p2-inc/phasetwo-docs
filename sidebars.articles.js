// sidebars.guides.js

module.exports = {
  articles: [
    "introduction",
    {
      type: "category",
      label: "JSON Web Tokens (JWT)",
      link: {
        type: "generated-index",
      },
      items: [
        "jwts/decoding-jwt-structure",
        "jwts/jwt-benefits-drawbacks",
        "jwts/jwt-security-best-practices",
      ], // resolves to guides/oidc-configuration.md, etc
    },
    // {
    //   type: "category",
    //   label: "Cat B",
    //   items: ["foo"], // resolves to guides/foo.md
    // },
  ],
};
