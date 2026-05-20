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

const ARROW = "arrow-mig";

export default function UserMigrationDiagram() {
  return (
    <DiagramFrame viewBox="0 0 480 320" height={320}>
      <Defs arrowId={ARROW} />
      <text x="240" y="20" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill={C_TEXT_DIM} letterSpacing="0.6">USERS MIGRATE ON FIRST LOGIN · NO PASSWORD RESET</text>

      <g transform="translate(20,46)">
        <rect width="130" height="130" rx="10" fill="#0a0a0a" stroke={C_NODE_BORDER} />
        <text x="65" y="22" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM} letterSpacing="0.5">LEGACY</text>
        <text x="65" y="42" textAnchor="middle" fontFamily="Inter" fontSize="11" fontWeight="700" fill="#fff">Auth0 · Cognito</text>
        <text x="65" y="56" textAnchor="middle" fontFamily="Inter" fontSize="11" fontWeight="700" fill="#fff">REST API · LDAP · SQL</text>
        <line x1="14" y1="68" x2="116" y2="68" stroke={C_LINE} />
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={i} cx={20 + (i % 6) * 18} cy={84 + Math.floor(i / 6) * 16} r="3.5" fill={i < 4 ? "rgba(255,255,255,0.12)" : C_BLUE_DIM} />
        ))}
        <text x="65" y="124" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" fill="#fff">5,432 users</text>
      </g>

      <g transform="translate(168,46)">
        <rect width="144" height="130" rx="10" fill="color-mix(in srgb, #3FA1E3 12%, #0F0F0F)" stroke={C_BLUE} strokeWidth="1.4" />
        <text x="72" y="22" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE} letterSpacing="0.5">PHASE TWO</text>
        <text x="72" y="40" textAnchor="middle" fontFamily="Inter" fontSize="11" fontWeight="700" fill="#fff">User Federation</text>
        <line x1="14" y1="50" x2="130" y2="50" stroke={C_LINE} />
        <text x="12" y="68" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT}>1. validate</text>
        <text x="12" y="84" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT}>2. import profile</text>
        <text x="12" y="100" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT}>3. write to KC</text>
        <text x="12" y="116" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT}>4. mark migrated</text>
      </g>

      <g transform="translate(330,46)">
        <rect width="130" height="130" rx="10" fill="#0a0a0a" stroke={C_NODE_BORDER} />
        <text x="65" y="22" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM} letterSpacing="0.5">KEYCLOAK</text>
        <text x="65" y="42" textAnchor="middle" fontFamily="Inter" fontSize="11" fontWeight="700" fill="#fff">Local users</text>
        <line x1="14" y1="54" x2="116" y2="54" stroke={C_LINE} />
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={i} cx={20 + (i % 6) * 18} cy={70 + Math.floor(i / 6) * 16} r="3.5" fill={i < 9 ? C_BLUE : "rgba(255,255,255,0.12)"} />
        ))}
        <text x="65" y="110" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" fill="#fff">4,242 migrated</text>
        <text x="65" y="124" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE_DIM}>+ growing</text>
      </g>

      <path d="M150 110 H 168" stroke={C_BLUE_DIM} strokeWidth="1.6" markerEnd={`url(#${ARROW})`} />
      <path d="M312 110 H 330" stroke={C_BLUE_DIM} strokeWidth="1.6" markerEnd={`url(#${ARROW})`} />
      <text x="159" y="100" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill={C_TEXT_DIM}>auth</text>
      <text x="321" y="100" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill={C_TEXT_DIM}>import</text>

      <g transform="translate(20,200)">
        <text x="0" y="0" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE_DIM} letterSpacing="0.5">MIGRATION PROGRESS</text>
        <text x="440" y="0" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM}>5,432 → 4,242</text>

        <rect x="0" y="14" width="440" height="14" rx="7" fill="rgba(255,255,255,0.06)" stroke={C_NODE_BORDER} />
        <rect x="0" y="14" width="344" height="14" rx="7" fill="url(#mig-progress)" />
        <defs>
          <linearGradient id="mig-progress" x1="0" x2="1">
            <stop offset="0%" stopColor="#3FA1E3" />
            <stop offset="100%" stopColor="#7FC4F0" />
          </linearGradient>
        </defs>
        <text x="220" y="26" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" fill="#fff">78%</text>

        {[
          { x: 0, d: "Day 1", v: "0%" },
          { x: 110, d: "Day 7", v: "34%" },
          { x: 220, d: "Day 14", v: "62%" },
          { x: 344, d: "Day 21", v: "78%" },
          { x: 440, d: "Day 30", v: "100%" },
        ].map((t, i) => (
          <g key={i}>
            <line x1={t.x} y1="36" x2={t.x} y2="42" stroke={C_TEXT_DIM} strokeWidth="0.8" />
            <text x={t.x} y="54" textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"} fontFamily="JetBrains Mono" fontSize="8" fill={C_TEXT_DIM}>{t.d}</text>
            <text x={t.x} y="66" textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"} fontFamily="JetBrains Mono" fontSize="8" fill={C_TEXT}>{t.v}</text>
          </g>
        ))}
      </g>
    </DiagramFrame>
  );
}
