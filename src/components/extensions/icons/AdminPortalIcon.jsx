import React from "react";
import IconBase from "./IconBase";

export default function AdminPortalIcon({ size = 56 }) {
  return (
    <IconBase size={size}>
      <rect x="8" y="11" width="40" height="34" rx="3" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="18" x2="48" y2="18" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="14.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="14.5" r="1" fill="currentColor" />
      <circle cx="19" cy="14.5" r="1" fill="currentColor" />
      <g transform="translate(28,31)" stroke="currentColor" strokeWidth="1.6" fill="none">
        <circle r="4" />
        <g strokeLinecap="round">
          <line x1="0" y1="-9" x2="0" y2="-6" />
          <line x1="0" y1="6" x2="0" y2="9" />
          <line x1="-9" y1="0" x2="-6" y2="0" />
          <line x1="6" y1="0" x2="9" y2="0" />
          <line x1="-6.3" y1="-6.3" x2="-4.3" y2="-4.3" />
          <line x1="4.3" y1="4.3" x2="6.3" y2="6.3" />
          <line x1="-6.3" y1="6.3" x2="-4.3" y2="4.3" />
          <line x1="4.3" y1="-4.3" x2="6.3" y2="-6.3" />
        </g>
      </g>
    </IconBase>
  );
}
