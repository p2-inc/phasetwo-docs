import React from "react";
import IconBase from "./IconBase";

export default function ContainersIcon({ size = 56 }) {
  return (
    <IconBase size={size}>
      <path d="M28 8L46 16v8L28 32 10 24v-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <path d="M10 16l18 8 18-8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <path d="M28 32v16" stroke="currentColor" strokeWidth="2" />
      <path d="M10 24v8l18 8 18-8v-8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" opacity="0.6" />
      <path d="M10 32v8l18 8 18-8v-8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" opacity="0.35" />
    </IconBase>
  );
}
