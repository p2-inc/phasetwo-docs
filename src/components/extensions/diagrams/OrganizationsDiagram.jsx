import React from "react";
import {
  DiagramFrame,
  Defs,
  C_BLUE,
  C_BLUE_DIM,
  C_LINE,
  C_NODE,
  C_NODE_BORDER,
  C_TEXT,
  C_TEXT_DIM,
} from "./DiagramPrimitives";

const ARROW = "arrow-orgs";

export default function OrganizationsDiagram() {
  return (
    <DiagramFrame viewBox="0 0 480 320" height={320}>
      <Defs arrowId={ARROW} />

      <g transform="translate(160,12)">
        <rect width="160" height="40" rx="8" fill={C_NODE} stroke={C_NODE_BORDER} />
        <circle cx="20" cy="20" r="7" fill={C_BLUE_DIM} />
        <text x="38" y="18" fontFamily="Inter" fontSize="11" fontWeight="700" fill="#fff">Your B2B app</text>
        <text x="38" y="32" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM}>app.acme-saas.com</text>
      </g>
      <path d="M240 52 V 70" stroke={C_BLUE_DIM} strokeWidth="1.4" markerEnd={`url(#${ARROW})`} />

      <rect x="20" y="76" width="300" height="232" rx="14" stroke={C_LINE} strokeWidth="1" fill="rgba(255,255,255,0.02)" />
      <text x="36" y="94" fontFamily="JetBrains Mono" fontSize="10" fill={C_TEXT_DIM} letterSpacing="0.6">KEYCLOAK REALM</text>

      {[
        { x: 36, y: 108, name: "Acme", sso: "Okta SAML", users: 142, accent: false },
        { x: 178, y: 108, name: "Globex", sso: "Azure OIDC", users: 89, accent: false },
        { x: 36, y: 210, name: "Initech", sso: "SAML", users: 31, accent: false },
        { x: 178, y: 210, name: "Stark", sso: "Google", users: 524, accent: true },
      ].map((o, i) => (
        <g key={i}>
          <rect
            x={o.x}
            y={o.y}
            width="126"
            height="88"
            rx="8"
            fill={o.accent ? "color-mix(in srgb, #3FA1E3 18%, #0F0F0F)" : C_NODE}
            stroke={o.accent ? C_BLUE : C_NODE_BORDER}
            strokeWidth={o.accent ? 1.4 : 1}
          />
          <text x={o.x + 12} y={o.y + 18} fontFamily="Inter" fontSize="11" fontWeight="700" fill="#fff">{o.name}</text>
          <text x={o.x + 12} y={o.y + 32} fontFamily="JetBrains Mono" fontSize="8.5" fill={C_TEXT_DIM} letterSpacing="0.4">ORGANIZATION</text>
          <line x1={o.x + 12} y1={o.y + 42} x2={o.x + 114} y2={o.y + 42} stroke={C_LINE} strokeWidth="0.6" />
          <circle cx={o.x + 18} cy={o.y + 55} r="3" fill={C_BLUE} />
          <text x={o.x + 26} y={o.y + 58} fontFamily="Inter" fontSize="9.5" fill={C_TEXT}>{o.sso}</text>
          <text x={o.x + 12} y={o.y + 74} fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM}>{o.users} users</text>
          <text x={o.x + 90} y={o.y + 74} fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM}>5 roles</text>
        </g>
      ))}

      <rect x="340" y="76" width="124" height="232" rx="10" fill="#0a0a0a" stroke={C_NODE_BORDER} />
      <text x="352" y="96" fontFamily="JetBrains Mono" fontSize="9.5" fill={C_BLUE} letterSpacing="0.6">PHASE TWO ORGS API</text>
      {[
        "POST /orgs",
        "GET  /orgs/:id",
        "POST /invites",
        "POST /idps",
        "PUT  /roles/:id",
        "GET  /members",
      ].map((line, i) => (
        <text key={i} x="352" y={120 + i * 22} fontFamily="JetBrains Mono" fontSize="10" fill={C_TEXT}>{line}</text>
      ))}
      <line x1="352" y1={120 + 6 * 22 - 4} x2="452" y2={120 + 6 * 22 - 4} stroke={C_LINE} />
      <text x="352" y={120 + 6 * 22 + 14} fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE_DIM} letterSpacing="0.4">+ SDKs · JS · Java · Go</text>
    </DiagramFrame>
  );
}
