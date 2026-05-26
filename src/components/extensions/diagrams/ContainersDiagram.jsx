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

export default function ContainersDiagram() {
  return (
    <DiagramFrame viewBox="0 0 480 320" height={320}>
      <Defs arrowId="arrow-containers" />
      <text x="180" y="20" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill={C_TEXT_DIM} letterSpacing="0.6">CONTAINER IMAGE</text>
      <text x="180" y="34" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE_DIM}>ghcr.io/p2-inc/keycloak:26.0</text>

      {[
        { y: 46, label: "Your customizations", sub: "themes/ providers/ kc.conf", accent: true },
        { y: 90, label: "Phase Two extensions", sub: "orgs · webhooks · magic-link · idp-wizard · admin-portal" },
        { y: 134, label: "Opinionated defaults", sub: "JVM tuning · health · metrics · TLS" },
        { y: 178, label: "Keycloak base", sub: "official upstream — pinned version" },
      ].map((r, i) => (
        <g key={i}>
          <rect
            x="20"
            y={r.y}
            width="320"
            height="36"
            rx="6"
            fill={r.accent ? "color-mix(in srgb, #3FA1E3 18%, #0F0F0F)" : C_NODE}
            stroke={r.accent ? C_BLUE : C_NODE_BORDER}
          />
          <text x="34" y={r.y + 16} fontFamily="Inter" fontSize="11" fontWeight="700" fill={r.accent ? "#fff" : C_TEXT}>{r.label}</text>
          <text x="34" y={r.y + 30} fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM}>{r.sub}</text>
          <text x="328" y={r.y + 24} textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill={C_TEXT_DIM}>L{4 - i}</text>
        </g>
      ))}

      <g transform="translate(356,46)">
        <rect width="104" height="168" rx="10" fill="#0a0a0a" stroke={C_NODE_BORDER} />
        <text x="52" y="20" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE} letterSpacing="0.5">DEPLOY</text>
        <line x1="12" y1="26" x2="92" y2="26" stroke={C_LINE} />
        {["Kubernetes", "Helm chart", "Docker Compose", "ECS · Fargate", "Bare metal", "Local · dev"].map((t, i) => (
          <g key={i}>
            <circle cx="18" cy={44 + i * 20} r="2" fill={C_BLUE} />
            <text x="26" y={47 + i * 20} fontFamily="Inter" fontSize="10" fill={C_TEXT}>{t}</text>
          </g>
        ))}
      </g>

      <rect x="20" y="232" width="440" height="72" rx="10" fill="#0a0a0a" stroke={C_NODE_BORDER} />
      <text x="32" y="250" fontFamily="JetBrains Mono" fontSize="9" fill={C_BLUE_DIM} letterSpacing="0.5">PULL · RUN</text>
      <g fontFamily="JetBrains Mono" fontSize="11">
        <text x="32" y="272" fill={C_TEXT_DIM}>$</text>
        <text x="48" y="272" fill="#A5D88E">docker pull</text>
        <text x="124" y="272" fill={C_TEXT}>ghcr.io/p2-inc/keycloak:26.0</text>
      </g>
      <g fontFamily="JetBrains Mono" fontSize="11">
        <text x="32" y="292" fill={C_TEXT_DIM}>$</text>
        <text x="48" y="292" fill="#A5D88E">helm install</text>
        <text x="128" y="292" fill={C_TEXT}>keycloak p2-inc/keycloak --version 26.0</text>
      </g>
    </DiagramFrame>
  );
}
