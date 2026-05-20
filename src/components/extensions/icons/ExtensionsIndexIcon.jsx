import React from "react";
import IconBase from "./IconBase";

export default function ExtensionsIndexIcon({ size = 56 }) {
  return (
    <IconBase size={size}>
      <rect x="9" y="9" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="31" y="9" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <rect x="9" y="31" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <rect x="31" y="31" width="16" height="16" rx="3" fill="currentColor" opacity="0.9" />
    </IconBase>
  );
}
