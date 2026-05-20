import React from "react";
import IconBase from "./IconBase";

export default function MagicLinkIcon({ size = 56 }) {
  return (
    <IconBase size={size}>
      <rect x="8" y="16" width="34" height="22" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8 18l17 12 17-12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <line x1="36" y1="36" x2="46" y2="46" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M44 10l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="currentColor" />
      <circle cx="42" cy="33" r="1.5" fill="currentColor" />
    </IconBase>
  );
}
