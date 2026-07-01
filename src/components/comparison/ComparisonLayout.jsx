import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import React, { useState } from "react";
import DemoModal from "../DemoModal";
import Icon from "./Icon";

const SITE = "https://phasetwo.io";
const DASH = "https://dash.phasetwo.io/";

const VENDOR_LINKS = [
  { key: "auth0", label: "vs. Auth0", to: "/keycloak-alternatives/auth0/" },
  { key: "okta", label: "vs. Okta", to: "/keycloak-alternatives/okta/" },
  { key: "workos", label: "vs. WorkOS", to: "/keycloak-alternatives/workos/" },
  { key: "ping-identity", label: "vs. Ping Identity", to: "/keycloak-alternatives/ping-identity/" },
  { key: "frontegg", label: "vs. FrontEgg", to: "/keycloak-alternatives/frontegg/" },
  { key: "onelogin", label: "vs. OneLogin", to: "/keycloak-alternatives/onelogin/" },
];

// Render a feature-matrix cell from a compact value:
//   'yes' | 'no' | 'lim' | '$$$' (or any "$" string) | {label, red}
function Cell({ cell }) {
  if (cell === "yes") return <span className="cell-yes"><Icon name="check" /></span>;
  if (cell === "no") return <span className="cell-no"><Icon name="x" /></span>;
  if (cell === "lim") return <span className="cell-lim"><Icon name="minus" /></span>;
  if (cell && typeof cell === "object") {
    const style = cell.red ? { background: "rgba(239,68,68,0.12)", color: "#EF4444" } : undefined;
    return <span className="cell-cost" style={style}>{cell.label}</span>;
  }
  return <span className="cell-cost">{cell}</span>;
}

function CmpCard({ vendor, rows, mini }) {
  return (
    <div className="cmp-card">
      <div className="cmp-head">
        <div className="t"><span className="ico"><Icon name="git-compare" /></span> {mini ? "At a glance" : "Feature & cost comparison"}</div>
        {mini ? <a href="#glance" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--primary)" }}>Full table →</a> : null}
      </div>
      <table className="cmp-grid">
        <thead>
          <tr>
            <th className="feat"></th>
            <th>{vendor}</th>
            <th className="you"><span className="you-tag">You</span><br />Keycloak{mini ? "" : " + Phase Two"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.feat}>
              <td className="feat">{r.feat}</td>
              <td><Cell cell={r.vendor} /></td>
              <td><Cell cell={r.keycloak} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Hero({ vendor, hero, slug }) {
  const primary = hero.primaryCta || { label: "Try for Free", href: DASH };
  const secondary = hero.secondaryCta;
  const logo = `/customer-logos/${slug}.svg`;
  const PrimaryBtn = (
    <a href={primary.href} target="_blank" rel="noreferrer">
      <button className="btn btn-primary btn-lg"><Icon name="zap" /> {primary.label}</button>
    </a>
  );
  const SecondaryBtn = secondary ? (
    <a href={secondary.href} className="btn btn-ghost btn-lg">{secondary.label}</a>
  ) : null;
  const backlink = (
    <Link to="/keycloak-alternatives/" className="backlink"><Icon name="arrow-left" /> All Keycloak alternatives</Link>
  );

  if (hero.variant === "A") {
    return (
      <header className="hero">
        <div className="glow"></div>
        <section className="hero-variant heroA">
          <div className="wrap">
            {backlink}
            <div className="vs-lockup">
              <div className="chip p2">
                <span className="badge-mark" style={{ background: "#3FA1E3" }}>
                  <img src="/img/comparison/phasetwo_logo_icon.svg" alt="" style={{ width: 30, borderRadius: 8 }} />
                </span>
                Keycloak
              </div>
              <span className="vs-x">VS</span>
              <div className="chip"><img className="vs-logo" src={logo} alt={vendor} /></div>
            </div>
            <h1>{hero.headline}</h1>
            <p className="lede">{hero.lede}</p>
            <div className="hero-cta">{PrimaryBtn}{SecondaryBtn}</div>
            {hero.savingsPill ? (
              <div className="savings-pill"><Icon name="trending-down" size={15} /> {hero.savingsPill}</div>
            ) : null}
          </div>
        </section>
      </header>
    );
  }

  if (hero.variant === "B") {
    const miniRows = hero.miniRows || [];
    return (
      <header className="hero">
        <div className="glow"></div>
        <section className="hero-variant heroB">
          <div className="wrap">
            {backlink}
            <div className="hero-split" style={{ marginTop: 26 }}>
              <div>
                <img className="hero-vendor-logo" src={logo} alt={vendor} />
                <div className="eyebrow vs"><span className="dot"></span>Keycloak vs. {vendor}</div>
                <h1>{hero.headline}</h1>
                <p className="lede">{hero.lede}</p>
                <div className="hero-cta" style={{ justifyContent: "flex-start" }}>{PrimaryBtn}{SecondaryBtn}</div>
                <div className="replaces">
                  <div className="lbl">Open-source parity with</div>
                  <div className="row"><span>Okta</span><span>Auth0</span><span>Ping</span><span>WorkOS</span><span>OneLogin</span></div>
                </div>
              </div>
              <div><CmpCard vendor={vendor} rows={miniRows} mini /></div>
            </div>
          </div>
        </section>
      </header>
    );
  }

  // Variant C — headline + illustrative cost-curve chart
  const chart = hero.chart || {};
  const xl = chart.xLabels || ["1k", "10k", "50k users"];
  return (
    <header className="hero">
      <div className="glow"></div>
      <section className="hero-variant heroC">
        <div className="wrap">
          {backlink}
          <div className="hero-chart-grid" style={{ marginTop: 26 }}>
            <div>
              <img className="hero-vendor-logo" src={logo} alt={vendor} />
              <div className="eyebrow vs"><span className="dot"></span>Keycloak vs. {vendor}</div>
              <h1>{hero.headline}</h1>
              <p className="lede">{hero.lede}</p>
              <div className="hero-cta" style={{ justifyContent: "flex-start" }}>{PrimaryBtn}{SecondaryBtn}</div>
            </div>
            <div className="chart-card">
              <div className="ct"><div className="t">{chart.title || "Annual identity spend vs. monthly active users"}</div><div className="num" style={{ fontSize: 11, color: "var(--muted)" }}>illustrative</div></div>
              <svg viewBox="0 0 420 240" width="100%" height="auto" role="img" aria-label={chart.ariaLabel || `Cost growth: ${vendor} climbs, Keycloak stays flat`}>
                <g stroke="rgba(255,255,255,0.06)" strokeWidth="1">
                  <line x1="46" y1="30" x2="46" y2="200" /><line x1="46" y1="200" x2="404" y2="200" />
                  <line x1="46" y1="158" x2="404" y2="158" /><line x1="46" y1="116" x2="404" y2="116" /><line x1="46" y1="74" x2="404" y2="74" />
                </g>
                <path d="M46 188 L130 168 L214 128 L298 78 L382 40 L382 200 L46 200 Z" fill="url(#vsfill)" opacity="0.5" />
                <path d="M46 188 L130 168 L214 128 L298 78 L382 40" fill="none" stroke="var(--vs)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M46 186 L130 184 L214 183 L298 182 L382 181" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <g fill="var(--vs)"><circle cx="382" cy="40" r="4" /></g>
                <g fill="var(--primary)"><circle cx="382" cy="181" r="4" /></g>
                <g fill="var(--muted)" fontFamily="JetBrains Mono, monospace" fontSize="9"><text x="10" y="203">$0</text><text x="2" y="119">$250k</text><text x="2" y="36">$500k</text></g>
                <g fill="var(--muted)" fontFamily="JetBrains Mono, monospace" fontSize="9" textAnchor="middle"><text x="88" y="215">{xl[0]}</text><text x="214" y="215">{xl[1]}</text><text x="340" y="215">{xl[2]}</text></g>
                <defs><linearGradient id="vsfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--vs)" stopOpacity="0.4" /><stop offset="1" stopColor="var(--vs)" stopOpacity="0" /></linearGradient></defs>
              </svg>
              <div className="chart-legend">
                <span><i style={{ background: "var(--vs)" }}></i> {chart.legendVendor || vendor}</span>
                <span><i style={{ background: "var(--primary)" }}></i> Keycloak + Phase Two (fixed)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}

function DuoSection({ onContact }) {
  return (
    <section className="content-sec section alt">
      <div className="wrap">
        <div className="head" style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}><span className="dot"></span>How we deliver</div>
          <h2 className="h-sec">Two ways to run Keycloak with Phase Two</h2>
        </div>
        <div className="duo">
          <div className="panel card">
            <div className="tile" style={{ background: "rgba(63,161,227,0.16)", color: "var(--primary)" }}><Icon name="cloud" size={22} /></div>
            <div style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, color: "var(--primary-2)", marginBottom: 6 }}>Managed Hosting</div>
            <h3>Managed Keycloak Hosting</h3>
            <p style={{ color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.65 }}>Multi-region, high-availability Keycloak with 100+ extensions. Simple, cost-conscious, and customizable.</p>
            <ul>
              <li><Icon name="check-circle-2" /> Up to 10,000+ concurrent users</li>
              <li><Icon name="check-circle-2" /> 99.99% uptime SLA &amp; SOC 2</li>
              <li><Icon name="check-circle-2" /> Custom domains &amp; branding</li>
              <li><Icon name="check-circle-2" /> Dedicated or shared clusters</li>
            </ul>
            <div className="ftr">
              <a href={DASH} target="_blank" rel="noreferrer"><button className="btn btn-primary"><Icon name="zap" /> Try for Free</button></a>
              <Link to="/hosting/" className="link-arrow">Learn more <Icon name="arrow-right" size={14} /></Link>
            </div>
          </div>
          <div className="panel card">
            <div className="tile" style={{ background: "var(--vs-soft)", color: "var(--vs)" }}><Icon name="life-buoy" size={22} /></div>
            <div style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, color: "var(--vs-2)", marginBottom: 6 }}>Enterprise Support</div>
            <h3>Enterprise Keycloak Support</h3>
            <p style={{ color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.65 }}>Run your own Keycloak? Get expert escalation, security patches, and architecture guidance — at any level of complexity.</p>
            <ul>
              <li><Icon name="check-circle-2" /> 24/7 escalation with named engineers</li>
              <li><Icon name="check-circle-2" /> Security advisories &amp; patch backports</li>
              <li><Icon name="check-circle-2" /> Architecture &amp; migration reviews</li>
              <li><Icon name="check-circle-2" /> Dedicated Slack channel</li>
            </ul>
            <div className="ftr">
              <button type="button" className="btn btn-vs" onClick={onContact}><Icon name="message-square" /> Contact</button>
              <Link to="/support/" className="link-arrow">Learn more <Icon name="arrow-right" size={14} /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ComparisonLayout({
  vendor,
  slug,
  accent = "magenta",
  meta,
  hero,
  atAGlance = [],
  sections = [],
  matrix,
  faqs = [],
  migration,
  bigcta,
}) {
  const { siteConfig: { customFields = {} } = {} } = useDocusaurusContext();
  const demoRequestEndpoint =
    typeof customFields.demoRequestEndpoint === "string"
      ? customFields.demoRequestEndpoint
      : undefined;
  const turnstileSiteKey =
    typeof customFields.turnstileSiteKey === "string"
      ? customFields.turnstileSiteKey
      : undefined;
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);

  const url = `${SITE}/keycloak-alternatives/${slug}/`;
  const splitAt = Math.min(3, sections.length);
  const before = sections.slice(0, splitAt);
  const after = sections.slice(splitAt);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.text },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Keycloak Alternatives", item: `${SITE}/keycloak-alternatives/` },
      { "@type": "ListItem", position: 3, name: `Keycloak vs. ${vendor}`, item: url },
    ],
  };

  const ContentSection = ({ s, alt }) => (
    <section className={`content-sec section${alt ? " alt" : ""}`} id={s.id}>
      <div className="wrap">
        <div className="sec-grid">
          <div className="left">
            <span className="kicker-num">{s.kicker}</span>
            <h2 className="h-sec">{s.title}</h2>
          </div>
          <div className="right prose">{s.body}</div>
        </div>
      </div>
    </section>
  );

  return (
    <Layout title={meta.title} description={meta.description}>
      <Head>
        {meta.keywords ? <meta name="keywords" content={meta.keywords} /> : null}
        <link rel="canonical" href={url} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        {faqs.length ? <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script> : null}
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Head>

      <div className={`kcvs accent-${accent}`}>
        <Hero vendor={vendor} hero={hero} slug={slug} />

        {/* At a glance */}
        <section className="glance section" id="glance">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow vs" style={{ marginBottom: 16 }}><span className="dot"></span>The short version</div>
              <h2 className="h-sec">Keycloak vs. {vendor} at a glance</h2>
            </div>
            <table className="gtable">
              <thead><tr><th>Dimension</th><th>{vendor}</th><th className="p2col">Keycloak (with Phase Two)</th></tr></thead>
              <tbody>
                {atAGlance.map((r) => (
                  <tr key={r.dim}>
                    <td className="dim">{r.dim}</td>
                    <td className="comp">{r.vendor}</td>
                    <td className="p2 p2col-cell">{r.check ? <span className="ok">✓</span> : null}{r.keycloak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {before.map((s, i) => <ContentSection key={s.title} s={s} alt={i % 2 === 1} />)}

        {/* Feature matrix */}
        {matrix ? (
          <section className="matrix-sec section">
            <div className="wrap">
              <div className="head">
                <div className="eyebrow vs" style={{ marginBottom: 16 }}><span className="dot"></span>The receipts</div>
                <h2 className="h-sec">See it side-by-side</h2>
                <p className="lede" style={{ maxWidth: 560, margin: "14px auto 0" }}>What you actually get for what you actually pay.</p>
              </div>
              <div className="matrix-wrap">
                <div className="cmp-card">
                  <div className="cmp-head"><div className="t"><span className="ico"><Icon name="git-compare" /></span> Feature &amp; cost comparison</div></div>
                  <table className="cmp-grid">
                    <thead><tr><th className="feat"></th><th>{vendor}</th><th className="you"><span className="you-tag">You</span><br />Keycloak + Phase Two</th></tr></thead>
                    <tbody>
                      {matrix.rows.map((r) => (
                        <tr key={r.feat}>
                          <td className="feat">{r.feat}</td>
                          <td><Cell cell={r.vendor} /></td>
                          <td><Cell cell={r.keycloak} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="cmp-foot">
                    <span><span className="num" style={{ color: "#fff", fontWeight: 700 }}>{matrix.savings || "~80%"}</span> avg. cost reduction on switch</span>
                    <button type="button" className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 13 }} onClick={openModal}><Icon name="calendar" /> Book a savings review</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {after.map((s, i) => <ContentSection key={s.title} s={s} alt={i % 2 === 1} />)}

        {/* Already using X? */}
        {migration ? (
          <section className="using section">
            <div className="wrap inner">
              <div className="eyebrow vs" style={{ marginBottom: 18 }}><span className="dot"></span>Migration</div>
              <h2 className="h-sec">{migration.heading || `Already using ${vendor}?`}</h2>
              <p className="lede" style={{ margin: "16px auto 26px", maxWidth: 560 }}>{migration.body}</p>
              <Link to="/support/migrate-to-keycloak/" className="btn btn-vs btn-lg"><Icon name="arrow-right-left" /> See how we migrate teams to Keycloak</Link>
            </div>
          </section>
        ) : null}

        <DuoSection onContact={openModal} />

        {/* FAQ */}
        {faqs.length ? (
          <section className="faq section">
            <div className="wrap">
              <div className="head">
                <div className="eyebrow" style={{ marginBottom: 16 }}><span className="dot"></span>FAQ</div>
                <h2 className="h-sec">Frequently asked questions</h2>
              </div>
              <div className="faq-list">
                {faqs.map((f, i) => (
                  <details key={f.q} open={i === 0}>
                    <summary>{f.q} <span className="pm"><Icon name="plus" /></span></summary>
                    <div className="ans">{f.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Cross-links */}
        <section className="crosslinks section-sm">
          <div className="wrap">
            <div className="panel">
              <div>
                <h4>Compare Keycloak to other IAM platforms</h4>
                <div className="sub">See how Keycloak stacks up against the leading commercial identity providers.</div>
              </div>
              <div className="chips">
                {VENDOR_LINKS.filter((v) => v.key !== slug).map((v) => (
                  <Link key={v.key} to={v.to}>{v.label}</Link>
                ))}
                <Link to="/keycloak-alternatives/" style={{ color: "var(--ink-2)" }}>View all alternatives →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Big CTA */}
        <section className="bigcta section">
          <div className="wrap">
            <h2>{bigcta?.heading || "See how much you'd save."}</h2>
            <p>{bigcta?.body}</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-primary btn-lg" onClick={openModal}><Icon name="calendar" /> Get a Demo</button>
              <a href={DASH} target="_blank" rel="noreferrer"><button className="btn btn-ghost btn-lg"><Icon name="zap" /> Try for Free</button></a>
            </div>
          </div>
        </section>
      </div>

      <DemoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        demoRequestEndpoint={demoRequestEndpoint}
        turnstileSiteKey={turnstileSiteKey}
      />
    </Layout>
  );
}
