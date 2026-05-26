import React from "react";

export const C_BLUE = "#3FA1E3";
export const C_BLUE_DIM = "rgba(63,161,227,0.35)";
export const C_LINE = "rgba(255,255,255,0.10)";
export const C_NODE = "#171717";
export const C_NODE_BORDER = "rgba(255,255,255,0.14)";
export const C_TEXT = "#E5E7EB";
export const C_TEXT_DIM = "#9CA3AF";

export function DiagramFrame({ children, viewBox = "0 0 400 240", height = 240 }) {
  return (
    <svg
      viewBox={viewBox}
      style={{ width: "100%", height: "auto", maxHeight: height, display: "block" }}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function Defs({ arrowId = "arrow" }) {
  return (
    <defs>
      <marker
        id={arrowId}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M0 0 L10 5 L0 10 z" fill={C_BLUE_DIM} />
      </marker>
    </defs>
  );
}
