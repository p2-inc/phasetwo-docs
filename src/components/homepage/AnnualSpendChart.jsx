import React from "react";

const DEFAULT_DATA = [
  { name: "Phase Two", amount: 21,  label: "$21K",  highlight: true },
  { name: "Auth0",     amount: 130, label: "$130K" },
  { name: "Okta",      amount: 118, label: "$118K" },
  { name: "Ping",      amount: 108, label: "$108K" },
  { name: "WorkOS",    amount: 84,  label: "$84K"  },
  { name: "FrontEgg",  amount: 75,  label: "$75K"  },
];

const DEFAULT_THEME = {
  panelBg:     "#1a1a1a",
  border:      "rgba(255,255,255,0.08)",
  ink:         "#E6EDF7",
  ink2:        "#B7C2D6",
  muted:       "#7E8AA3",
  greyBar:     "#2A3142",
  greyInk:     "#6F7A92",
  primary:     "#3FA1E3",
  primaryLite: "#7FC4F0",
  success:     "#34D399",
  trackBg:     "rgba(255,255,255,0.03)",
};

export default function AnnualSpendChart({
  data = DEFAULT_DATA,
  title = "Annual identity spend",
  sampleLabel = "~150K MAU · 25K CONCURRENT",
  savedAmount = "$109K",
  savedSuffix = "vs. Auth0 list",
  methodologyHref = "#methodology",
  theme: themeOverrides = {},
  style = {},
  onMethodologyClick,
}) {
  const t = { ...DEFAULT_THEME, ...themeOverrides };
  const max = Math.max(...data.map((r) => r.amount));

  const styles = {
    panel: {
      background: t.panelBg,
      border: `1px solid ${t.border}`,
      borderRadius: 18,
      padding: 28,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif',
      color: t.ink,
      ...style,
    },
    headerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 18,
      borderBottom: `1px solid ${t.border}`,
    },
    headerLeft: { display: "flex", alignItems: "center", gap: 12 },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 9,
      background: "rgba(63,161,227,0.18)",
      color: t.primary,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    titleText: { fontSize: 16, fontWeight: 600, color: t.ink },
    sample: {
      fontFamily: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace',
      textTransform: "uppercase",
      letterSpacing: "0.16em",
      fontSize: 10,
      color: t.muted,
    },
    rows: {
      marginTop: 22,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    num: {
      fontFamily: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace',
      fontVariantNumeric: "tabular-nums",
      letterSpacing: "-0.01em",
    },
    footerRow: {
      marginTop: 22,
      paddingTop: 18,
      borderTop: `1px solid ${t.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    methodologyLink: {
      fontSize: 13,
      fontWeight: 600,
      color: t.primary,
      display: "flex",
      alignItems: "center",
      gap: 6,
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.panel} role="figure" aria-label={title}>
      <div style={styles.headerRow}>
        <div style={styles.headerLeft}>
          <span style={styles.iconWrap} aria-hidden="true">
            <BarChartIcon />
          </span>
          <span style={styles.titleText}>{title}</span>
        </div>
        <span style={styles.sample}>{sampleLabel}</span>
      </div>

      <div style={styles.rows}>
        {data.map((r) => (
          <SpendRow key={r.name} row={r} max={max} theme={t} numStyle={styles.num} />
        ))}
      </div>

      <div style={styles.footerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: t.success, display: "flex" }} aria-hidden="true">
            <TrendingDownIcon />
          </span>
          <span style={{ ...styles.num, fontSize: 17, fontWeight: 700, color: t.ink }}>
            {savedAmount} saved
          </span>
          <span style={{ fontSize: 13, color: t.muted }}>{savedSuffix}</span>
        </div>
        {methodologyHref && (
          <a href={methodologyHref} onClick={onMethodologyClick} style={styles.methodologyLink}>
            See methodology <ArrowUpRightIcon />
          </a>
        )}
      </div>
    </div>
  );
}

function SpendRow({ row, max, theme: t, numStyle }) {
  const isUs = !!row.highlight;
  const widthPct = (row.amount / max) * 100;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: 13, fontWeight: isUs ? 700 : 500, color: isUs ? t.ink : t.ink2 }}>
        {row.name}
      </div>
      <div style={{ position: "relative", height: isUs ? 36 : 28, borderRadius: 9, background: t.trackBg, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            insetBlock: 0,
            left: 0,
            width: `${widthPct}%`,
            background: isUs
              ? `linear-gradient(90deg, ${t.primary} 0%, ${t.primaryLite} 100%)`
              : t.greyBar,
            borderRadius: 9,
            boxShadow: isUs ? "0 0 26px rgba(63,161,227,0.45)" : "none",
          }}
        />
      </div>
      <div style={{ ...numStyle, textAlign: "right", fontSize: 16, fontWeight: isUs ? 700 : 500, color: isUs ? t.ink : t.greyInk }}>
        {row.label}
      </div>
    </div>
  );
}

function BarChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <rect x="7"  y="13" width="3" height="5" />
      <rect x="12" y="9"  width="3" height="9" />
      <rect x="17" y="5"  width="3" height="13" />
    </svg>
  );
}

function TrendingDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export { DEFAULT_DATA, DEFAULT_THEME };
