import React from "react";
import {
  DiagramFrame,
  Defs,
  C_BLUE,
  C_BLUE_DIM,
  C_LINE,
  C_NODE_BORDER,
  C_TEXT,
  C_TEXT_DIM,
} from "./DiagramPrimitives";

const ARROW = "arrow-idp";

export default function IdpWizardDiagram() {
  return (
    <DiagramFrame viewBox="0 0 400 240" height={240}>
      <Defs arrowId={ARROW} />
      <rect x="10" y="14" width="280" height="212" rx="10" stroke={C_LINE} fill="rgba(255,255,255,0.02)" />
      <circle cx="22" cy="26" r="3" fill="rgba(255,255,255,0.18)" />
      <circle cx="32" cy="26" r="3" fill="rgba(255,255,255,0.12)" />
      <circle cx="42" cy="26" r="3" fill="rgba(255,255,255,0.12)" />
      <rect x="56" y="20" width="220" height="12" rx="4" fill="rgba(255,255,255,0.05)" />
      <text x="62" y="29" fontFamily="JetBrains Mono" fontSize="8" fill={C_TEXT_DIM}>yourapp.com/admin/sso</text>
      <line x1="10" y1="42" x2="290" y2="42" stroke={C_LINE} strokeWidth="0.8" />

      <text x="22" y="60" fontFamily="Inter" fontSize="11" fontWeight="700" fill="#fff">Connect your identity provider</text>
      <text x="22" y="74" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM}>STEP 1 OF 3</text>

      {[
        { x: 22, label: "Okta", sel: false },
        { x: 92, label: "Azure", sel: true },
        { x: 162, label: "Google", sel: false },
        { x: 232, label: "SAML", sel: false },
      ].map((o, i) => (
        <g key={i}>
          <rect
            x={o.x}
            y="86"
            width="58"
            height="44"
            rx="6"
            fill={o.sel ? "color-mix(in srgb, #3FA1E3 18%, #0F0F0F)" : "#0a0a0a"}
            stroke={o.sel ? C_BLUE : C_NODE_BORDER}
            strokeWidth={o.sel ? 1.4 : 1}
          />
          <circle cx={o.x + 29} cy="103" r="6" fill={o.sel ? C_BLUE : "rgba(255,255,255,0.08)"} />
          <text x={o.x + 29} y="124" textAnchor="middle" fontFamily="Inter" fontSize="9" fontWeight="600" fill={o.sel ? "#fff" : C_TEXT}>{o.label}</text>
        </g>
      ))}

      <rect x="22" y="142" width="246" height="64" rx="8" fill="rgba(63,161,227,0.06)" stroke={C_BLUE} strokeWidth="1" />
      <text x="32" y="158" fontFamily="JetBrains Mono" fontSize="8.5" fill={C_BLUE} letterSpacing="0.5">AUTO-DISCOVERED</text>
      <text x="32" y="174" fontFamily="Inter" fontSize="10" fill="#fff">Tenant: acme.onmicrosoft.com</text>
      <text x="32" y="188" fontFamily="Inter" fontSize="10" fill="#fff">Claim mapping: email · name · groups</text>
      <rect x="200" y="174" width="58" height="20" rx="10" fill={C_BLUE} />
      <text x="229" y="187" textAnchor="middle" fontFamily="Inter" fontSize="9" fontWeight="700" fill="#fff">Connect</text>

      <path d="M290 120 H 312" stroke={C_BLUE_DIM} strokeWidth="1.4" markerEnd={`url(#${ARROW})`} />
      <g transform="translate(312,86)">
        <rect width="78" height="72" rx="10" fill="color-mix(in srgb, #3FA1E3 18%, #0F0F0F)" stroke={C_BLUE} strokeWidth="1.2" />
        <text x="39" y="22" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill={C_BLUE} letterSpacing="0.5">LIVE</text>
        <circle cx="39" cy="38" r="9" fill="none" stroke={C_BLUE} strokeWidth="1.6" />
        <path d="M34 38l4 4 7-7" stroke={C_BLUE} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="39" y="62" textAnchor="middle" fontFamily="Inter" fontSize="9" fontWeight="700" fill="#fff">SSO live</text>
      </g>

      <text x="200" y="226" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM} letterSpacing="0.6">CUSTOMER SELF-SERVES · NO SUPPORT TICKET</text>
    </DiagramFrame>
  );
}
