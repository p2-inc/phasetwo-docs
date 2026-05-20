import React from "react";
import IconBase from "./IconBase";

export default function EventsIcon({ size = 56 }) {
  return (
    <IconBase size={size}>
      <circle cx="28" cy="14" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="14" cy="40" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="42" cy="40" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M28 19v7l-10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M28 26l11 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </IconBase>
  );
}
