import React from "react";
import IconBase from "./IconBase";

export default function ThemesIcon({ size = 56 }) {
  return (
    <IconBase size={size}>
      <path
        d="M28 9c-10.5 0-19 7.6-19 17 0 6.5 5 12 11 12 2.2 0 4-1.5 4-3.5 0-1.5-1.2-2.5-1.2-4 0-1.6 1.3-2.5 3-2.5h4.2c6.6 0 12-4.5 12-11 0-4.4-3.6-8-14-8z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="22" r="2.5" fill="currentColor" />
      <circle cx="24" cy="16" r="2.5" fill="currentColor" opacity="0.75" />
      <circle cx="33" cy="16" r="2.5" fill="currentColor" opacity="0.55" />
      <circle cx="39" cy="23" r="2.5" fill="currentColor" opacity="0.35" />
    </IconBase>
  );
}
