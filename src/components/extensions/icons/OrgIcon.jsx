import React from "react";
import IconBase from "./IconBase";

export default function OrgIcon({ size = 56 }) {
  return (
    <IconBase size={size}>
      <rect x="9" y="12" width="38" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="24" width="30" height="9" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <rect x="17" y="36" width="22" height="9" rx="2" fill="currentColor" opacity="0.85" />
      <circle cx="17" cy="16.5" r="1.5" fill="currentColor" />
      <circle cx="21.5" cy="16.5" r="1.5" fill="currentColor" />
    </IconBase>
  );
}
