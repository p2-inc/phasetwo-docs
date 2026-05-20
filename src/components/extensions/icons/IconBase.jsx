import React from "react";

export default function IconBase({ children, size = 56 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ color: "var(--ifm-color-primary)" }}
    >
      {children}
    </svg>
  );
}
