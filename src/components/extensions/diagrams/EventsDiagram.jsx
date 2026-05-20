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

export default function EventsDiagram() {
  return (
    <DiagramFrame viewBox="0 0 480 320" height={320}>
      <Defs arrowId="arrow-events" />
      <text x="240" y="20" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill={C_TEXT_DIM} letterSpacing="0.6">EVENT ROUTING &amp; FAN-OUT</text>

      <text x="20" y="44" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE_DIM} letterSpacing="0.5">EVENTS</text>
      {[
        { y: 56, label: "USER_LOGIN", sub: "realm:acme", accent: true },
        { y: 92, label: "USER_REGISTER", sub: "realm:globex" },
        { y: 128, label: "ROLE_CHANGE", sub: "realm:acme" },
        { y: 164, label: "PASSWORD_RESET", sub: "realm:initech" },
        { y: 200, label: "INVITE_ACCEPT", sub: "realm:stark" },
      ].map((e, i) => (
        <g key={i}>
          <rect
            x="20"
            y={e.y}
            width="140"
            height="28"
            rx="6"
            fill={e.accent ? "color-mix(in srgb, #3FA1E3 14%, #0F0F0F)" : C_NODE}
            stroke={e.accent ? C_BLUE : C_NODE_BORDER}
          />
          <text x="32" y={e.y + 13} fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" fill={e.accent ? "#fff" : C_TEXT}>{e.label}</text>
          <text x="32" y={e.y + 23} fontFamily="JetBrains Mono" fontSize="8" fill={C_TEXT_DIM}>{e.sub}</text>
        </g>
      ))}

      <rect x="190" y="100" width="100" height="120" rx="10" fill="color-mix(in srgb, #3FA1E3 14%, #0F0F0F)" stroke={C_BLUE} strokeWidth="1.4" />
      <text x="240" y="124" textAnchor="middle" fontFamily="Inter" fontSize="11" fontWeight="700" fill="#fff">Event router</text>
      <text x="240" y="140" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8.5" fill={C_BLUE} letterSpacing="0.4">SPI · SCRIPTS</text>
      <line x1="200" y1="152" x2="280" y2="152" stroke={C_LINE} />
      <text x="240" y="170" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM}>filter</text>
      <text x="240" y="186" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM}>map</text>
      <text x="240" y="202" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM}>retry</text>

      {[70, 106, 142, 178, 214].map((y, i) => (
        <path key={i} d={`M160 ${y} C 175 ${y}, 180 160, 190 160`} stroke={C_BLUE_DIM} strokeWidth="1.2" fill="none" />
      ))}

      <text x="320" y="44" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE_DIM} letterSpacing="0.5">DESTINATIONS</text>
      {[
        { y: 56, label: "POST webhook", sub: "audit.yourapp.com", accent: true },
        { y: 92, label: "Slack", sub: "#identity-alerts" },
        { y: 128, label: "S3", sub: "compliance/audit/" },
        { y: 164, label: "Salesforce", sub: "Contact.upsert" },
        { y: 200, label: "Kafka", sub: "topic: identity" },
      ].map((d, i) => (
        <g key={i}>
          <rect
            x="320"
            y={d.y}
            width="140"
            height="28"
            rx="6"
            fill={d.accent ? "color-mix(in srgb, #3FA1E3 18%, #0F0F0F)" : C_NODE}
            stroke={d.accent ? C_BLUE : C_NODE_BORDER}
          />
          <text x="332" y={d.y + 13} fontFamily="Inter" fontSize="10" fontWeight="700" fill={d.accent ? "#fff" : C_TEXT}>{d.label}</text>
          <text x="332" y={d.y + 23} fontFamily="JetBrains Mono" fontSize="8" fill={C_TEXT_DIM}>{d.sub}</text>
        </g>
      ))}

      {[70, 106, 142, 178, 214].map((y, i) => (
        <path key={i} d={`M290 160 C 300 160, 305 ${y}, 320 ${y}`} stroke={C_BLUE_DIM} strokeWidth="1.2" fill="none" />
      ))}

      <text x="240" y="306" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM} letterSpacing="0.5">RETRY · DLQ · IDEMPOTENT · SIGNED PAYLOADS</text>
    </DiagramFrame>
  );
}
