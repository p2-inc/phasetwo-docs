import React from "react";
import { DiagramFrame, Defs, C_TEXT_DIM } from "./DiagramPrimitives";

export default function ThemesDiagram() {
  return (
    <DiagramFrame viewBox="0 0 400 220" height={220}>
      <Defs arrowId="arrow-themes" />
      <text x="200" y="30" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill={C_TEXT_DIM} letterSpacing="0.6">LOGIN · ACCOUNT · ADMIN</text>
      {[
        { x: 50, off: 0, c: "#3FA1E3", label: "Login" },
        { x: 95, off: 22, c: "rgba(63,161,227,0.7)", label: "Account" },
        { x: 140, off: 44, c: "rgba(63,161,227,0.4)", label: "Admin" },
      ].map((t, i) => (
        <g key={i} transform={`translate(${t.x},${50 + t.off})`}>
          <rect width="210" height="110" rx="10" fill="color-mix(in srgb, #3FA1E3 14%, #0F0F0F)" stroke={t.c} strokeWidth="1.4" />
          <circle cx="20" cy="22" r="6" fill={t.c} opacity="0.8" />
          <rect x="14" y="42" width="180" height="10" rx="5" fill="rgba(255,255,255,0.06)" />
          <rect x="14" y="58" width="180" height="10" rx="5" fill="rgba(255,255,255,0.06)" />
          <rect x="14" y="80" width="80" height="14" rx="6" fill={t.c} />
          <text x="14" y="22" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#fff" dx="14" dy="4">{t.label}</text>
        </g>
      ))}
    </DiagramFrame>
  );
}
