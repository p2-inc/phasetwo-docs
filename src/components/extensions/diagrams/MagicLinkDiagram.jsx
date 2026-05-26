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

const ARROW = "arrow-magic";

export default function MagicLinkDiagram() {
  return (
    <DiagramFrame viewBox="0 0 480 280" height={280}>
      <Defs arrowId={ARROW} />

      <text x="20" y="20" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE_DIM} letterSpacing="0.5">USE CASES</text>
      {[
        { x: 20, label: "Passwordless login" },
        { x: 170, label: "Email invitation", accent: true },
        { x: 310, label: "Verify email change" },
      ].map((u, i) => (
        <g key={i}>
          <rect
            x={u.x}
            y="30"
            width="140"
            height="28"
            rx="14"
            fill={u.accent ? "color-mix(in srgb, #3FA1E3 18%, #0F0F0F)" : C_NODE}
            stroke={u.accent ? C_BLUE : C_NODE_BORDER}
          />
          <text x={u.x + 70} y="48" textAnchor="middle" fontFamily="Inter" fontSize="10" fontWeight="600" fill={u.accent ? "#fff" : C_TEXT}>{u.label}</text>
        </g>
      ))}
      <path d="M240 60 V 76" stroke={C_BLUE_DIM} strokeWidth="1.4" markerEnd={`url(#${ARROW})`} />

      <g transform="translate(20,82)">
        <rect width="138" height="100" rx="10" fill="#0a0a0a" stroke={C_NODE_BORDER} />
        <text x="12" y="18" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE} letterSpacing="0.5">1 · API CALL</text>
        <line x1="12" y1="24" x2="126" y2="24" stroke={C_LINE} />
        <text x="12" y="42" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT}>POST /magic-link</text>
        <text x="12" y="58" fontFamily="JetBrains Mono" fontSize="8.5" fill={C_TEXT_DIM}>{"{"}</text>
        <text x="20" y="70" fontFamily="JetBrains Mono" fontSize="8.5" fill="#A5D88E">  "email": "..."</text>
        <text x="20" y="82" fontFamily="JetBrains Mono" fontSize="8.5" fill="#A5D88E">  "ttl": 600</text>
        <text x="12" y="94" fontFamily="JetBrains Mono" fontSize="8.5" fill={C_TEXT_DIM}>{"}"}</text>
      </g>
      <path d="M158 132 H 178" stroke={C_BLUE_DIM} strokeWidth="1.4" markerEnd={`url(#${ARROW})`} />

      <g transform="translate(178,82)">
        <rect width="138" height="100" rx="10" fill="#0a0a0a" stroke={C_BLUE} strokeWidth="1.2" />
        <text x="12" y="18" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE} letterSpacing="0.5">2 · EMAIL</text>
        <line x1="12" y1="24" x2="126" y2="24" stroke={C_LINE} />
        <text x="12" y="40" fontFamily="Inter" fontSize="9.5" fontWeight="600" fill="#fff">Sign in to Acme</text>
        <text x="12" y="54" fontFamily="Inter" fontSize="8.5" fill={C_TEXT_DIM}>Click the button below.</text>
        <rect x="12" y="62" width="86" height="22" rx="11" fill={C_BLUE} />
        <text x="55" y="76" textAnchor="middle" fontFamily="Inter" fontSize="9" fontWeight="700" fill="#fff">Sign in →</text>
        <text x="12" y="93" fontFamily="JetBrains Mono" fontSize="7.5" fill={C_TEXT_DIM}>expires in 10 min</text>
      </g>
      <path d="M316 132 H 336" stroke={C_BLUE_DIM} strokeWidth="1.4" markerEnd={`url(#${ARROW})`} />

      <g transform="translate(336,82)">
        <rect width="124" height="100" rx="10" fill="color-mix(in srgb, #3FA1E3 14%, #0F0F0F)" stroke={C_BLUE} strokeWidth="1.4" />
        <text x="12" y="18" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE} letterSpacing="0.5">3 · SIGNED IN</text>
        <line x1="12" y1="24" x2="112" y2="24" stroke={C_LINE} />
        <circle cx="62" cy="54" r="16" fill="none" stroke={C_BLUE} strokeWidth="1.8" />
        <path d="M54 54l6 6 12-12" stroke={C_BLUE} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="62" y="84" textAnchor="middle" fontFamily="Inter" fontSize="9.5" fontWeight="700" fill="#fff">Session created</text>
      </g>

      <rect x="20" y="200" width="440" height="62" rx="10" fill="#0a0a0a" stroke={C_NODE_BORDER} />
      <text x="32" y="218" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE_DIM} letterSpacing="0.5">SIGNED URL ANATOMY</text>
      <g fontFamily="JetBrains Mono" fontSize="10.5">
        <text x="32" y="240" fill={C_TEXT_DIM}>https://acme.app/m/</text>
        <text x="156" y="240" fill="#A5D88E">tk_eyJhbGciOi…</text>
        <text x="266" y="240" fill={C_TEXT_DIM}>?ttl=</text>
        <text x="296" y="240" fill="#E0A66E">600</text>
        <text x="322" y="240" fill={C_TEXT_DIM}>&amp;sig=</text>
        <text x="356" y="240" fill="#A5D88E">b7c3…</text>
      </g>
      <text x="32" y="256" fontFamily="JetBrains Mono" fontSize="8.5" fill={C_TEXT_DIM}>HMAC-signed · single-use · server-validated</text>
    </DiagramFrame>
  );
}
