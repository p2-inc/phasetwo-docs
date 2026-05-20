import React from "react";

export default function IconTile({ children, size = 64, className = "" }) {
  return (
    <div
      className={`ext-icon-tile ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
      }}
    >
      {children}
    </div>
  );
}
