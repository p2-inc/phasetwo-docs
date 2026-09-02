// sidebars.tutorials.js
//
// Track structure follows ideas/tutorials/tutorial-ideas.md in the content-marketing repo.
// Tracks are added as their first tutorials land — an empty category renders as a dead end.

module.exports = {
  tutorials: [
    "index",
    {
      type: "category",
      label: "Getting started",
      link: { type: "generated-index" },
      items: [
        "getting-started/run-keycloak-locally",
        "getting-started/first-realm-client-user",
        "getting-started/your-first-token",
      ],
    },
    {
      type: "category",
      label: "JSON Web Tokens (JWT)",
      link: { type: "doc", id: "jwts/index" },
      items: [
        "jwts/decoding-jwt-structure",
        "jwts/jwt-benefits-drawbacks",
        "jwts/jwt-security-best-practices",
      ],
    },
  ],
};
