import React from "react";
import IconBase from "./IconBase";

export default function IdpWizardIcon({ size = 56 }) {
  return (
    <IconBase size={size}>
      <rect x="9" y="20" width="14" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="33" y="20" width="14" height="16" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <path d="M23 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 14l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="currentColor" />
      <path d="M16 42l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="currentColor" opacity="0.7" />
    </IconBase>
  );
}
