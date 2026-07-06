import Link from "@docusaurus/Link";
import React from "react";

/**
 * Reusable cross-link block for the "Keycloak alternatives" cluster.
 * Drop it on comparison-adjacent pages to point up to the hub and across to
 * the sibling comparison pages. Keeps the hub-and-spoke internal linking
 * consistent. Pass `exclude` (a vendor key) to hide the current page's own link.
 */
const LINKS = [
  { key: "auth0", label: "vs. Auth0", to: "/keycloak-alternatives/auth0/" },
  { key: "okta", label: "vs. Okta", to: "/keycloak-alternatives/okta/" },
  { key: "workos", label: "vs. WorkOS", to: "/keycloak-alternatives/workos/" },
  { key: "ping-identity", label: "vs. Ping Identity", to: "/keycloak-alternatives/ping-identity/" },
  { key: "frontegg", label: "vs. FrontEgg", to: "/keycloak-alternatives/frontegg/" },
  { key: "onelogin", label: "vs. OneLogin", to: "/keycloak-alternatives/onelogin/" },
];

export default function CompareKeycloakBlock({ exclude }) {
  const links = exclude ? LINKS.filter((l) => l.key !== exclude) : LINKS;

  return (
    <aside className="compare-keycloak-block">
      <div className="compare-keycloak-block-head">
        <h3 className="compare-keycloak-block-title">
          Compare Keycloak to other IAM platforms
        </h3>
        <p className="compare-keycloak-block-sub">
          See how Keycloak stacks up against the leading commercial identity providers.
        </p>
      </div>
      <ul className="compare-keycloak-block-links">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to}>{l.label}</Link>
          </li>
        ))}
      </ul>
      <Link to="/keycloak-alternatives/" className="link-primary">
        View all Keycloak alternatives <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}
