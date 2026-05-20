import React from "react";
import {
  DiagramFrame,
  Defs,
  C_BLUE,
  C_BLUE_DIM,
  C_LINE,
  C_NODE_BORDER,
  C_TEXT_DIM,
} from "./DiagramPrimitives";

export default function AdminPortalDiagram() {
  return (
    <DiagramFrame>
      <Defs arrowId="arrow-admin" />
      <rect x="14" y="20" width="372" height="200" rx="14" stroke={C_LINE} strokeWidth="1" fill="rgba(255,255,255,0.02)" />
      <text x="200" y="40" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill={C_TEXT_DIM} letterSpacing="0.6">YOUR APP — yourapp.com/settings</text>

      <rect x="28" y="56" width="80" height="148" rx="8" fill="#0a0a0a" stroke={C_NODE_BORDER} />
      <rect x="36" y="64" width="64" height="6" rx="3" fill="rgba(255,255,255,0.10)" />
      <rect x="36" y="78" width="56" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="36" y="92" width="48" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="36" y="106" width="60" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="36" y="120" width="64" height="6" rx="3" fill="rgba(63,161,227,0.5)" />

      <rect
        x="120"
        y="56"
        width="252"
        height="148"
        rx="10"
        fill="color-mix(in srgb, #3FA1E3 12%, #0F0F0F)"
        stroke={C_BLUE}
        strokeWidth="1.4"
      />
      <text x="132" y="73" fontFamily="Inter" fontSize="11" fontWeight="700" fill="#fff">Admin Portal</text>
      <text x="132" y="86" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM} letterSpacing="0.4">SCOPED TO: Organization A</text>
      {[103, 124, 145, 166, 187].map((y, i) => (
        <g key={i} opacity={1 - i * 0.12}>
          <rect x="132" y={y} width="20" height="10" rx="5" fill={C_BLUE_DIM} />
          <rect x="158" y={y + 1} width="80" height="8" rx="3" fill="rgba(255,255,255,0.10)" />
          <rect x="246" y={y + 1} width="40" height="8" rx="3" fill="rgba(255,255,255,0.06)" />
          <rect x="296" y={y + 1} width="60" height="8" rx="3" fill="rgba(255,255,255,0.06)" />
        </g>
      ))}
    </DiagramFrame>
  );
}
