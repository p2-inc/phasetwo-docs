import React from "react";
import IconBase from "./IconBase";

export default function UserMigrationIcon({ size = 56 }) {
  return (
    <IconBase size={size}>
      <circle cx="13" cy="20" r="5" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <path d="M5 38c0-5 3.5-9 8-9s8 4 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" fill="none" />
      <circle cx="43" cy="20" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M35 38c0-5 3.5-9 8-9s8 4 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M23 28h11M30 24l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </IconBase>
  );
}
