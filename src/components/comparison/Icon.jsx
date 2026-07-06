import React from "react";

// Inline SVG icons (Lucide paths) so the comparison pages don't need the
// external lucide CDN script. Sizing is handled by comparison.css (e.g.
// `.kcvs .btn svg`), with a 16px default for standalone use.
const PATHS = {
  "arrow-left": <><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>,
  "arrow-down": <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>,
  "arrow-right": <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  "arrow-right-left": <><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></>,
  calendar: <><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  "check-circle-2": <><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></>,
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  "file-text": <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></>,
  "git-compare": <><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M11 18H8a2 2 0 0 1-2-2V9" /></>,
  "life-buoy": <><circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 4.24 4.24" /><path d="m14.83 9.17 4.24-4.24" /><path d="m14.83 14.83 4.24 4.24" /><path d="m9.17 14.83-4.24 4.24" /><circle cx="12" cy="12" r="4" /></>,
  "message-square": <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  minus: <path d="M5 12h14" />,
  plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  "sliders-horizontal": <><line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" /><line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" /><line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" /><line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" /></>,
  "trending-down": <><path d="M16 17h6v-6" /><path d="m22 17-8.5-8.5-5 5L2 7" /></>,
  x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10" />,
};

export default function Icon({ name, size = 16, className, style }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {path}
    </svg>
  );
}
