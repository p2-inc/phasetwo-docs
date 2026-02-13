import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { InlineIcon } from "@iconify/react";
import Layout from "@theme/Layout";
import { useEffect, useRef, useState } from "react";
import StartYourJourney from "../components/ctas/start-your-journey";
import Cta from "../components/ctas/homepage-dual-line-cta";
import FrameworkTabs from "../components/FrameworkTabs";
import styles from "./styles.module.css";
import integrationsStyles from "./product/integrations.module.css";

const INTEGRATIONS_ICON_COLOR = "#A0A9DB";
function iconifyImgSrc(icon, { color = INTEGRATIONS_ICON_COLOR } = {}) {
  return `https://api.iconify.design/${icon}.svg?color=${encodeURIComponent(color)}`;
}

const HostingItems = [
  {
    name: "Multi-Region, High-Availability Clusters",
    desc: (
      <p>
        Hosted in multiple regions for high availability and low latency. Ensure uptime and performance. Choose to deploy in areas to comply with data residency requirements or specific applications needs.
      </p>
    ),
    icon: "tabler:pig-money",
    cta: "Explore Architecture",
    href: "/pricing",
  },
  {
    name: "Unlimited Users & SSO Connections",
    desc: (
      <p>
        Unlimited users and SSO connections for a single, flat price. Fees don't explode as your app grows and scales.
      </p>
    ),
    icon: "carbon:ibm-dynamic-route-server",
    cta: "Explore Architecture",
    href: "/product/sso",
  },
  {
    name: "24/7 Monitor, Alert, Backup",
    desc: (
      <p>
        24/7/365 support. We aggressively monitor your clusters and can connect to your existing systems to integrate with existing SRE practices. Routine DB backups are included.
      </p>
    ),
    icon: "gis:globe-alt",
    cta: "Explore architecture",
    href: "/hosting",
  },
  {
    name: "Version Upgrades",
    desc: (
      <p>
        We keep your instance(s) up to date with the latest Keycloak releases ensuring CVE's and other security issues are patched. Teams that self-host cite this as a major pain point.
      </p>
    ),
    icon: "ix:project-server",
    cta: "Why it matters",
    href: "/hosting",
  },
  {
    name: "Load-based Pricing, Not User Count",
    desc: (
      <p>
        Clusters are priced by active session count, not total users in the database.
      </p>
    ),
  },
  {
    name: "Extend and Customize",
    desc: (
      <p>
        Our included extensions make it easy to run Keycloak. Customize your Keycloak instance further with your own extensions and themes.
      </p>
    ),
  },
  {
    name: "Access Control",
    desc: (
      <p>
        Control access to your cluster and deployments to ensure secure settings and access to Admin endpoints and public access.
      </p>
    ),
  },
];

const EnhancedFeatures = [
  {
    title: "Organizations",
    description: "Multi-tenancy for applications coupled with Enterprise SSO. Enable customer domain based SSO for one or many domains.",
    icon: "lucide:building-2",
  },
  {
    title: "IdP Wizard",
    description: "Enable customers to automatically configure identity providers and SSO saving your team time.",
    icon: "lucide:wand-2",
  },
  {
    title: "Magic Link",
    description: "Add passwordless authentication via links sent to emails.",
    icon: "lucide:link",
  },
  {
    title: "Admin Portal",
    description: "User self-management for their account (mfa methods and more) along with organizations.",
    icon: "lucide:layout-dashboard",
  },
  {
    title: "Events",
    description: "Audit logging for compliance and webhooks for user and system activity notifications.",
    icon: "lucide:calendar-clock",
  },
  {
    title: "Themes",
    description: "Admin UI theme customization to avoid building a custom theme.",
    icon: "lucide:palette",
  },
];

const ScaleFeatures = [
  {
    title: "Proactive Load Monitoring",
    description: "We let you know there might be an issue before there is",
    icon: "lucide:chart-line",
  },
  {
    title: "24/7 Support and On-Call",
    description: "Here when you need us",
    icon: "lucide:phone",
  },
  {
    title: "Smart App Integration",
    description: "Lean on our expertise to integrate with Keycloak for multiple use-cases",
    icon: "lucide:puzzle",
  },
  {
    title: "Export Logs",
    description: "Integrate logs to your own SIEM/SOAR for additional monitoring",
    icon: "lucide:file-output",
  },
  {
    title: "Zero-Downtime Upgrades",
    description: "Stay on the most recent Keycloak version with zero effort or downtime",
    icon: "lucide:circle-arrow-up",
  },
  {
    title: "Access and Permissions",
    description: "Manage team members and roles",
    icon: "lucide:key-round",
  },
];

const SupportItems = [
  {
    name: "On-premise Deployments + Infrastructure Design",
    desc: (
      <p>
        We can assist with <span className="font-semibold">designing</span> and{" "}
        <span className="font-semibold">deploying</span> Keycloak{" "}
        <span className="font-semibold">on-premise</span> or in the{" "}
        <span className="font-semibold">cloud</span>, leveraging the expertise
        we've built over the years to{" "}
        <span className="font-semibold">design and deploy robust systems</span>.
      </p>
    ),
    icon: "mdi:cloud-lock-outline",
    cta: "Learn more",
    href: "/hosting",
  },
  {
    name: "24/7 On-call Escalation",
    desc: (
      <p>
        We can provide <b>24/7 on-call escalation</b> for your Keycloak
        infrastructure, ensuring that in the event of an outage or other issue,
        your team has someone to call.
      </p>
    ),
    icon: "mdi:phone",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "Keycloak Implementation, Scale, and Growth",
    desc: (
      <p>
        Whether just getting started or scaling up, we can assist with this. We
        have experience with Keycloak deployments of <b>all sizes</b> and{" "}
        <b>complexity</b>.
      </p>
    ),
    icon: "fluent:arrow-growth-20-filled",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "Infrastructure and Code Review",
    desc: (
      <p>
        Reviewing your Keycloak infrastructure and code to ensure best practices
        are being followed. From IAC, SPI and Extension audits, to configuring
        metrics and alerts.
      </p>
    ),
    icon: "streamline:code-analysis",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "Migration to Keycloak",
    desc: (
      <p>
        Adopting an open-source IAM involves starts with user migration but also
        includes knowing how to map functionality from your existing IAM to
        Keycloak. This can involve <b>custom user providers</b> or{" "}
        <b>extensions</b> to accommodate existing applications.
      </p>
    ),
    icon: "mdi:rotate-orbit",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "IAM Consolidation to Keycloak",
    desc: (
      <p>
        Many customers are looking to consolidate multiple IAMs into Keycloak to
        reduce <b>costs and complexity</b>. Keycloak can support this, but
        requires careful planning and execution.
      </p>
    ),
    icon: "mdi:consolidate",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "Keycloak Upgrades",
    desc: (
      <p>
        Many Keycloak installations are <b>multiple major versions behind</b>{" "}
        and keeping up to date is a <b>major pain point</b> for many teams, but
        critical for <b>security</b> and <b>functionality</b>. Working through
        the upgrade process, including testing, practice, rollback planning, and
        finally executing the upgrade is something we excel at.
      </p>
    ),
    icon: "solar:server-square-update-broken",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "Custom Keycloak Development",
    desc: (
      <p>
        We specialize in <b>Keycloak development</b> and can assist with custom
        development, including extensions, themes, and custom providers to solve
        any number of use cases. We have extensive knowledge of the system.
      </p>
    ),
    icon: "hugeicons:code",
    cta: "Learn more",
    href: "/support",
  },
];

const customerLogos = [
  { file: "alarm-com.svg", name: "Alarm.com", classes: "" },
  // { file: "benifex@2x.png", name: "Benifex", classes: "m-8 h-[50px]" },
  { file: "bosch.svg", name: "Bosch", classes: "m-8" },
  { file: "brightsign.svg", name: "BrightSign", classes: "m-8" },
  { file: "continental.svg", name: "Continental", classes: "m-8" },
  // { file: "dandh@2x.png", name: "D&H", classes: "m-8 h-[50px]" },
  { file: "dexcom.svg", name: "Dexcom", classes: "m-8" },
  { file: "fastly.svg", name: "Fastly", classes: "m-8" },
  // { file: "granicus@2x.png", name: "Granicus", classes: "m-8 h-[50px]" },
  { file: "gusto.svg", name: "Gusto", classes: "m-8" },
  { file: "idemia.svg", name: "IDEMIA", classes: "m-8" },
  // { file: "kape@2x.png", name: "Kape Technologies", classes: "m-8 h-[50px]" },
  // { file: "keenfinity-group-fka-Bosch.svg", name: "Keenfinity Group", classes: "m-8 h-[42px]" },
  // { file: "later@2x.png", name: "Later", classes: "m-8 h-[45px]" },
  // { file: "ndoe@2x.png", name: "NDOE", classes: "m-8 h-[50px]" },
  // { file: "nieuwestroom@2x.png", name: "Nieuwestroom", classes: "m-8 h-[50px]" },
  // { file: "nura@2x.png", name: "Nura", classes: "m-8 h-[50px]" },
  { file: "perforce.svg", name: "Perforce", classes: "m-8" },
  // { file: "plotly@2x.png", name: "Plotly", classes: "m-8 h-[50px]" },
  // { file: "spl_logo@2x.png", name: "SPL", classes: "m-8 h-[50px]" },
  //{ file: "spl_presentmore@2x.png", name: "SPL PresentMore", classes: "m-8 h-[50px]" },
  { file: "teamworks.svg", name: "Teamworks", classes: "m-8" },
  //{ file: "testaify@2x.png", name: "Testaify", classes: "m-8 h-[50px]" },
  //{ file: "toolstation@2x.png", name: "Toolstation", classes: "m-8 h-[50px]" },
  { file: "toppan-merrill.svg", name: "Toppan Merrill", classes: "m-8" },
  //{ file: "trivalence@2x.png", name: "Trivalence", classes: "m-8 h-[50px]" },
  //{ file: "tsmc@2x.png", name: "TSMC", classes: "m-8 h-[50px]" },
  { file: "unstructured.svg", name: "Unstructured", classes: "m-8" },
];

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const [activeTab, setActiveTab] = useState(0);
  const mainRef = useRef(null);
  const gsapApiRef = useRef(null);
  const gsapCtxRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) return;

    let cancelled = false;

    const register = async () => {
      const scopeEl = mainRef.current;
      if (!scopeEl) return;

      if (!gsapApiRef.current) {
        // Load as early as possible (no idle deferral) so animations can start quickly.
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({
          limitCallbacks: true,
          ignoreMobileResize: true,
        });

        gsapApiRef.current = { gsap, ScrollTrigger };
      }

      const { gsap, ScrollTrigger } = gsapApiRef.current;

      if (!gsapCtxRef.current) {
        // Create a single context for the whole homepage and add animations into it over time.
        gsapCtxRef.current = gsap.context(() => {}, scopeEl);
      }

      // Capture candidates (only those not registered yet).
      const candidates = Array.from(scopeEl.querySelectorAll("[data-scroll-slide-in]")).filter(
        (el) => el instanceof HTMLElement && el.dataset.gsapScrollSlideInRegistered !== "true"
      );
      if (!candidates.length) return;

      // Measure first to avoid layout thrash (read first, then write).
      const measured = candidates.map((el) => ({
        el,
        rect: el.getBoundingClientRect(),
      }));

      const parseDelayMs = (el) => {
        const raw = el.style.getPropertyValue("--scroll-slide-in-delay")?.trim();
        if (!raw) return null;
        const ms = Number.parseFloat(raw);
        return Number.isFinite(ms) ? ms : null;
      };

      // Compute delays with group-based staggering (same behavior as before).
      const groupCounters = new WeakMap();
      let globalSeq = 0;
      const getDelayMs = (el) => {
        const existing = parseDelayMs(el);
        if (existing != null) return existing;

        const groupEl = el.closest("[data-scroll-slide-group]");
        if (!groupEl) return Math.min(globalSeq++ * 80, 560);

        const prev = groupCounters.get(groupEl) ?? 0;
        groupCounters.set(groupEl, prev + 1);
        const baseDelayMs =
          Number(groupEl.getAttribute("data-scroll-slide-group-base-delay") ?? 0) || 0;
        return baseDelayMs + Math.min(prev * 80, 560);
      };

      const startY = -24; // slightly less motion = less work + less jank
      const startThreshold = window.innerHeight * 0.85;

      gsapCtxRef.current.add(() => {
        for (const { el, rect } of measured) {
          el.dataset.gsapScrollSlideInRegistered = "true";

          // If element is already within the trigger zone, keep it visible (no flash/hide).
          const alreadyInZone = rect.top < startThreshold && rect.bottom > 0;
          if (alreadyInZone) {
            gsap.set(el, { autoAlpha: 1, y: 0, clearProps: "transform,opacity" });
            continue;
          }

          // Initial hidden state only for content below the fold.
          gsap.set(el, {
            autoAlpha: 0,
            y: startY,
            willChange: "transform,opacity",
          });

          const delayMs = getDelayMs(el);
          const tween = gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            delay: delayMs / 1000,
            paused: true,
            // Drop will-change after animating to reduce layer pressure.
            onComplete: () => {
              el.style.willChange = "";
            },
            clearProps: "transform,opacity",
          });

          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            onEnter: (self) => {
              tween.play();
              self.kill();
            },
          });
        }

        // Refresh once per registration pass (not per element).
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
    };

    register();

    return () => {
      cancelled = true;
      // NOTE: we intentionally don't revert the whole context on every tab switch
      // (it would kill triggers that haven't fired yet). We only revert on unmount.
    };
  }, [activeTab]);

  useEffect(() => {
    return () => {
      gsapCtxRef.current?.revert();
      gsapCtxRef.current = null;
    };
  }, []);

  return (
    <Layout description={`${siteConfig.tagline}`}>
      {/* Main Content */}
      <main ref={mainRef}>
        {/* Hero Section */}
        <section className="homepage-section homepage-hero-section">
          <div className="relative isolate">
            <div>
              <div className="hero-boxes-container flex flex-col md:flex-row gap-0">
                {/* Managed Keycloak Hosting Box */}
                <div className="hero-box hero-box-primary">
                  <div className="hero-box-image mb-6">
                    <img 
                      src="/img/hero-managed-keycloak-hosting.svg" 
                      alt="Managed Keycloak Hosting"
                      className="hero-box-image-img"
                    />
                  </div>
                  
                  <div className="hero-box-content">
                    <h1 className="text-balance text-white mb-6">
                      Managed Keycloak Hosting
                    </h1>
                    
                    <p className="text-pretty text-gray-300 mb-6">
                      Simple, Cost-Conscious, Customizable, Enhanced Keycloak
                      Hosting for 99% of Use-Cases.
                    </p>
                    
                    <div className="mt-auto flex flex-col items-center justify-center gap-4">
                      <a href="https://dash.phasetwo.io/" target="_blank">
                        <button className="btnPrimary min-w-[160px]">Try for Free</button>
                      </a>
                      <Link
                        href={"/hosting"}
                        className="link-primary"
                      >
                        Learn more <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Enterprise Keycloak Support Box */}
                <div className="hero-box hero-box-secondary">
                  <div className="hero-box-image mb-6">
                    <img 
                      src="/img/hero-enterprise-keycloak-support.svg" 
                      alt="Enterprise Keycloak Support"
                      className="hero-box-image-img"
                    />
                  </div>
                  
                  <div className="hero-box-content">
                    <h1 className="text-balance text-white mb-6">
                      Enterprise Keycloak Support
                    </h1>
                    
                    <p className="text-pretty text-gray-300 mb-6">
                      Expert Keycloak Support for Enterprises Coming to or
                      Using Keycloak at any Level of Complexity.
                    </p>
                    
                    <div className="mt-auto flex flex-col items-center justify-center gap-4">
                      <Link to="/contact">
                        <button className="btnPrimary btnSupport min-w-[160px]">
                          Contact
                        </button>
                      </Link>
                      <Link
                        to="/support"
                        className="link-secondary"
                      >
                        Learn more <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        <section className="onprem-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 flex justify-center">
            <div>
              <span className="text-white">On-prem and Managed Infrastructure? </span>
              <Link to="/product/onprem">
                Read more <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Top level explanation */}
        <section className="homepage-section">
          <div className="px-6 sm:px-6 lg:px-8">
            {/* Top image */}
            <div className="mb-12 flex justify-center">
              <img 
                src="/img/keycloak-general.svg" 
                alt="Keycloak" 
                className="w-full max-w-4xl"
              />
            </div>
            
            <div className="mx-auto text-center max-w-[var(--content-width-narrow)]" data-scroll-slide-group>
              <h2 className="text-balance" data-scroll-slide-in>
                Enterprise-Grade, Open-Source Identity and Access Management
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-gray-600" data-scroll-slide-in>
                Keycloak is a powerful open-source identity and access
                management system capable of replacing any IAM with capabilities
                for{" "}
                <Link to="/product/sso" className="font-semibold">
                  SSO
                </Link>{" "}
                and multi-tenant{" "}
                <Link to="/product/organizations" className="font-semibold">
                  User Management
                </Link>
                .
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="https://dash.phasetwo.io/"
                  target="_blank"
                  className="btnPrimary"
                >
                  Get started
                </a>
                <Link
                  href="/product/sso"
                  className="font-semibold text-p2blue-600"
                >
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="homepage-section logos-section">
          <div>
            <div>
              <p className="text-center font-normal text-white" data-scroll-slide-in>
                Working with customers from startups to Fortune 500 companies.
              </p>
              <div className="p2-marquee mt-6 overflow-hidden" aria-label="Customer logos">
                <div className="p2-marquee-track flex">
                  {[...customerLogos, ...customerLogos].map((logo, index) => (
                    <img
                      key={`${logo.file}-${index}`}
                      src={`/customer-logos/${logo.file}`}
                      className={logo.classes}
                      alt={`${logo.name} logo`}
                      loading="lazy"
                      decoding="async"
                      {...(index >= customerLogos.length
                        ? { "aria-hidden": true }
                        : undefined)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hosting */}
        <section className="homepage-section hosting-block px-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Section title */}
            <div className="mb-12 flex justify-center" data-scroll-slide-group>
              <h2 className="section-title-primary" data-scroll-slide-in>Managed Keycloak Hosting</h2>
            </div>
            
            {/* Header with h2 on left and intro text on right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 mx-auto" style={{maxWidth: '880px'}} data-scroll-slide-group>
              <div>
                <h2 className="text-white" data-scroll-slide-in>
                  Extended with Everything You Need To Run Keycloak
                </h2>
              </div>
              <div className="flex items-center">
                <p className="text-gray-300" data-scroll-slide-in>
                  Every deployment is packed with our{" "}
                  <a
                    href="https://github.com/p2-inc#our-extensions-"
                    target="_blank"
                    className="font-medium text-p2blue-400 hover:text-p2blue-300"
                  >
                    popular extensions
                  </a>{" "}
                  to make Keycloak easier to use and more powerful. Provided at a{" "}
                  <span className="font-medium">consistent, predictable price</span> that doesn't balloon based
                  on users or IdP connections.
                </p>
              </div>
            </div>

            {/* Bento Layout */}
            <div className="hosting-bento-grid" data-scroll-slide-group>
              {/* Row 1: Full width box */}
              <div className="hosting-bento-box hosting-bento-box-full" data-scroll-slide-in>
                <div className="hosting-bento-image">
                  <img 
                    src="/img/managed-keycloak-hosting-top.svg" 
                    alt={HostingItems[0].name}
                    className="w-full h-auto"
                  />
                </div>
                <div className="hosting-bento-content hosting-bento-content-first">
                  <h3 className="text-white mb-4">{HostingItems[0].name}</h3>
                  <div className="text-gray-300 hosting-bento-text">{HostingItems[0].desc}</div>
                  {HostingItems[0].cta && HostingItems[0].href && (
                    <Link
                      to={HostingItems[0].href}
                      className="hosting-bento-link"
                    >
                      {HostingItems[0].cta} <span className="hosting-bento-link-arrow" aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Row 2: 3 boxes with images */}
              {HostingItems.slice(1, 4).map((item, index) => {
                const imageMap = [
                  "/img/managed-keycloak-hosting-unlimited-users.svg",
                  "/img/managed-keycloak-hosting-monitor-backup.svg",
                  "/img/managed-keycloak-hosting-version-upgrades.svg"
                ];
                return (
                  <div key={item.name} className="hosting-bento-box hosting-bento-box-image-bottom" data-scroll-slide-in>
                    <div className="hosting-bento-content">
                      <h4 className="text-white mb-4">{item.name}</h4>
                      <div className="text-gray-300 hosting-bento-text">{item.desc}</div>
                      {item.cta && item.href && (
                        <Link
                          to={item.href}
                          className="hosting-bento-link"
                        >
                          {item.cta} <span className="hosting-bento-link-arrow" aria-hidden="true">→</span>
                        </Link>
                      )}
                    </div>
                    <div className="hosting-bento-image hosting-bento-image-bottom">
                      <img 
                        src={imageMap[index]} 
                        alt={item.name}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Row 3: 3 boxes (last 3 items) */}
              {HostingItems.slice(4, 7).map((item) => (
                <div key={item.name} className="hosting-bento-box" data-scroll-slide-in>
                  <div className="hosting-bento-content">
                    <h4 className="text-white mb-4">{item.name}</h4>
                    <div className="text-gray-300 hosting-bento-text">{item.desc}</div>
                    {item.cta && item.href && (
                      <Link
                        to={item.href}
                        className="hosting-bento-link"
                      >
                        {item.cta} <span className="hosting-bento-link-arrow" aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Cta
          background="primary"
          primaryText="Ready to try Keycloak?"
          secondaryText="Create your free deployment today."
          showCta
          ctaLabel="Try for Free"
          ctaHref="https://dash.phasetwo.io/"
          animateHeading
        />

        {/* Support */}
        <section className="homepage-section support-block support-bento-section px-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Section title */}
            <div className="mb-12 flex justify-center" data-scroll-slide-group>
              <h2 className="section-title-primary" data-scroll-slide-in>Enterprise Keycloak Support</h2>
            </div>
            
            {/* Header with h2 on left and intro text on right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 mx-auto" style={{maxWidth: '880px'}} data-scroll-slide-group>
              <div>
                <h2 className="text-white" data-scroll-slide-in>
                  Expertise to Help Adopt or Extend Keycloak
                </h2>
              </div>
              <div className="flex items-center">
                <p className="text-gray-300" data-scroll-slide-in>
                  Every deployment is packed with our popular extensions to make Keycloak easier to use and more powerful. Provided at a consistent, predictable price that doesn't balloon based on users or IdP connections.
                </p>
              </div>
            </div>

            {/* Bento Layout */}
            <div className="hosting-bento-grid" data-scroll-slide-group>
              {/* Row 1: Full width box */}
              <div className="hosting-bento-box hosting-bento-box-full" data-scroll-slide-in>
                <div className="hosting-bento-image">
                  <img 
                    src="/img/enterprise-keycloak-support-top.svg" 
                    alt={SupportItems[0].name}
                    className="w-full h-auto"
                  />
                </div>
                <div className="hosting-bento-content hosting-bento-content-first">
                  <h3 className="text-white mb-4">{SupportItems[0].name}</h3>
                  <div className="text-gray-300 hosting-bento-text">{SupportItems[0].desc}</div>
                  {SupportItems[0].cta && SupportItems[0].href && (
                    <Link
                      to={SupportItems[0].href}
                      className="hosting-bento-link"
                    >
                      {SupportItems[0].cta} <span className="hosting-bento-link-arrow" aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Row 2: 3 boxes */}
              {SupportItems.slice(1, 4).map((item, index) => {
                const imageMap = [
                  "/img/enterprise-keycloak-support-scale.svg",
                  "/img/enterprise-keycloak-support-infra.svg",
                  "/img/enterprise-keycloak-support-migration.svg"
                ];
                return (
                  <div key={item.name} className="hosting-bento-box hosting-bento-box-image-bottom" data-scroll-slide-in>
                    <div className="hosting-bento-content">
                      <h4 className="text-white mb-4">{item.name}</h4>
                      <div className="text-gray-300 hosting-bento-text">{item.desc}</div>
                      {item.cta && item.href && (
                        <Link
                          to={item.href}
                          className="hosting-bento-link"
                        >
                          {item.cta} <span className="hosting-bento-link-arrow" aria-hidden="true">→</span>
                        </Link>
                      )}
                    </div>
                    <div className="hosting-bento-image hosting-bento-image-bottom">
                      <img 
                        src={imageMap[index]} 
                        alt={item.name}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Row 3: 3 boxes (items 5-7) */}
              {SupportItems.slice(4, 7).map((item) => (
                <div key={item.name} className="hosting-bento-box" data-scroll-slide-in>
                  <div className="hosting-bento-content">
                    <h4 className="text-white mb-4">{item.name}</h4>
                    <div className="text-gray-300 hosting-bento-text">{item.desc}</div>
                    {item.cta && item.href && (
                      <Link
                        to={item.href}
                        className="hosting-bento-link"
                      >
                        {item.cta} <span className="hosting-bento-link-arrow" aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Cta
          background="secondary"
          primaryText="Working with our team is easy."
          secondaryText="Let us show you how."
          showCta
          ctaLabel="Get in touch"
          ctaHref="/contact"
        />

        {/* Migrate to Phase Two */}
        <section className="homepage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[560px] text-center mb-12">
              <h2 id="replaceIAMs" className="text-white mb-4">
                Migrate to Phase Two and Keycloak from Any Existing Identity Provider
              </h2>
              <p className="text-gray-300">
                Connect to any framework in any developer stack.
              </p>
            </div>
            
            {/* Top Image */}
            <div className="mb-12 flex justify-center">
              <img 
                src="/img/migrate-to-keycloak.svg" 
                alt="Migrate to Keycloak" 
                className="w-full max-w-4xl"
              />
            </div>
            
            {/* Tabbed Structure */}
            <FrameworkTabs
              tabs={[
                { key: "frameworks", label: "Developer Frameworks" },
                { key: "protocols", label: "Protocols" },
                { key: "idps", label: "Identity Providers" },
              ]}
              activeIndex={activeTab}
              onChange={setActiveTab}
              panels={[
                <div key="frameworks" className="framework-tab-panel">
                  <p className="framework-tab-text">
                    Phase Two can secure <span className="underline">web frameworks</span> or native applications
                    to provide authentication and authorization services.
                  </p>
                  <div className="framework-tab-image">
                    <div
                      className={`${styles.engLogoGrid} ${integrationsStyles.integrationsGrid}`}
                      role="list"
                      data-scroll-slide-group
                      data-scroll-slide-group-base-delay="80"
                    >
                      {[
                        { href: "https://phasetwo.io/docs/securing-applications/django", title: "Django", src: "/customer-logos/django.svg", alt: "Django" },
                        { href: "https://phasetwo.io/docs/securing-applications/springboot", title: "Spring Boot", src: "/customer-logos/spring.svg", alt: "Spring" },
                        { href: "https://phasetwo.io/docs/securing-applications/javascript", title: "Javascript", src: "/customer-logos/js.svg", alt: "JavaScript" },
                        { title: "nodejs", src: "/customer-logos/nodejs.svg", alt: "Node.js" },
                        { href: "https://phasetwo.io/docs/securing-applications/react", title: "React", src: "/customer-logos/react.svg", alt: "React" },
                        { href: "https://phasetwo.io/docs/securing-applications/next", title: "Next.js", src: "/customer-logos/nextjs.svg", alt: "Next.js" },
                        { href: "https://phasetwo.io/docs/securing-applications/vue", title: "Vue", src: "/customer-logos/vue.svg", alt: "Vue" },
                        { href: "https://phasetwo.io/docs/securing-applications/nuxt", title: "Nuxt", src: "/customer-logos/nuxtjs.svg", alt: "Nuxt" },
                        { href: "https://phasetwo.io/docs/securing-applications/remix", title: "Remix", src: "/customer-logos/remix.svg", alt: "Remix" },
                        { href: "https://phasetwo.io/docs/securing-applications/sveltekit", title: "Sveltekit", src: "/customer-logos/svelte.svg", alt: "Svelte" },
                        { href: "https://phasetwo.io/docs/securing-applications/angular", title: "Angular", src: "/customer-logos/angular.svg", alt: "Angular" },
                        { title: "GoLang", src: "/customer-logos/go.svg", alt: "Go" },
                        { title: "Android", src: "/customer-logos/android.svg", alt: "Android" },
                        { title: "Apple", src: "/customer-logos/apple.svg", alt: "Apple" },
                        { title: "php", src: "/customer-logos/php.svg", alt: "PHP" },
                        { title: "c#", src: "/customer-logos/csharp.svg", alt: "C#" },
                      ].map((logo) => {
                        const tile = (
                          <div className={`${styles.engLogoTile} ${integrationsStyles.integrationsTile} ${integrationsStyles.integrationsTileIdp}`} role="listitem" data-scroll-slide-in>
                            <img src={logo.src} alt={logo.alt} className={integrationsStyles.idpLogoImg} loading="lazy" decoding="async" />
                          </div>
                        );
                        return logo.href ? (
                          <a key={logo.title || logo.alt} href={logo.href} title={logo.title}>
                            {tile}
                          </a>
                        ) : (
                          <div key={logo.title || logo.alt} title={logo.title}>
                            {tile}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>,
                <div key="protocols" className="framework-tab-panel">
                  <p className="framework-tab-text">
                    Support for industry-standard protocols including OAuth 2.0, OpenID Connect, SAML 2.0, and
                    more. Seamlessly integrate with existing authentication systems.
                  </p>
                  <div className="framework-tab-image">
                    <div className={`${styles.engLogoGrid} ${integrationsStyles.integrationsGrid}`} role="list" data-scroll-slide-group data-scroll-slide-group-base-delay="80">
                      {[
                        { src: "/customer-logos/saml.svg", alt: "SAML" },
                        { src: "/customer-logos/openid.svg", alt: "OpenID" },
                      ].map((logo) => (
                        <div key={logo.alt} className={`${styles.engLogoTile} ${integrationsStyles.integrationsTile} ${integrationsStyles.integrationsTileIdp}`} role="listitem" data-scroll-slide-in>
                          <img src={logo.src} alt={logo.alt} className={integrationsStyles.idpLogoImg} loading="lazy" decoding="async" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>,
                <div key="idps" className="framework-tab-panel">
                  <p className="framework-tab-text">
                    Connect with major identity providers including Okta, Auth0, Azure AD, Google Workspace,
                    Active Directory, and many others. Migrate or broker identities seamlessly.
                  </p>
                  <div className="framework-tab-image">
                    <div className={`${styles.engLogoGrid} ${integrationsStyles.integrationsGrid}`} role="list" data-scroll-slide-group data-scroll-slide-group-base-delay="80">
                      {[
                        { src: "/customer-logos/bitbucket.svg", alt: "Bitbucket", icon: "fa-brands:bitbucket" },
                        { src: "/customer-logos/facebook.svg", alt: "Facebook", icon: "fa-brands:facebook" },
                        { src: "/customer-logos/github.svg", alt: "Github", icon: "fa-brands:github" },
                        { src: "/customer-logos/gitlab.svg", alt: "Gitlab", icon: "fa-brands:gitlab" },
                        { src: "/customer-logos/google.svg", alt: "Google", icon: "fa-brands:google" },
                        { src: "/customer-logos/instagram.svg", alt: "Instagram", icon: "fa-brands:instagram" },
                        { src: "/customer-logos/linkedin.svg", alt: "LinkedIn", icon: "fa-brands:linkedin" },
                        { src: "/customer-logos/microsoft.svg", alt: "Microsoft", icon: "fa-brands:microsoft" },
                        { src: "/customer-logos/azure.svg", alt: "Azure", icon: "carbon:logo-azure" },
                        { src: "/customer-logos/openshift.svg", alt: "Openshift", icon: "carbon:logo-openshift" },
                        { src: "/customer-logos/paypal.svg", alt: "Paypal", icon: "fa-brands:paypal" },
                        { src: "/customer-logos/stack-overflow.svg", alt: "StackOverflow", icon: "fa-brands:stack-overflow" },
                        { src: "/customer-logos/x.svg", alt: "X", icon: "fa6-brands:x-twitter" },
                        { src: "/customer-logos/onelogin.svg", alt: "Onelogin" },
                        { src: "/customer-logos/adsf.svg", alt: "ADFS" },
                        { src: "/customer-logos/ping-identity.svg", alt: "PingIdentity" },
                        { src: "/customer-logos/duo.svg", alt: "DUO" },
                        { src: "/customer-logos/jumpcloud.svg", alt: "JumpCloud" },
                      ].map((logo) => (
                        <div key={logo.alt} className={`${styles.engLogoTile} ${integrationsStyles.integrationsTile} ${integrationsStyles.integrationsTileIdp}`} role="listitem" data-scroll-slide-in>
                          <img src={logo.src ?? iconifyImgSrc(logo.icon)} alt={logo.alt} className={integrationsStyles.idpLogoImg} loading="lazy" decoding="async" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>,
              ]}
            />
            
          </div>
        </section>
        {/* Keycloak Enhanced */}
        <section className="homepage-section cta-section-radial-pattern">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[560px] text-center mb-12" data-scroll-slide-group>
              <h2 id="openSourceSSO" className="text-white mb-4" data-scroll-slide-in>
                Keycloak Enhanced to Fully Solve Modern Application Requirements
              </h2>
              <p className="text-gray-300" data-scroll-slide-in>
                Phase Two's extensions to core Keycloak solve for the needs that Applications need, and core Keycloak is missing. All deployments on Phase Two come automatically ready with all features ready.
              </p>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-12 gap-6 mt-16 items-center">
              {/* Features Grid - 8 columns */}
              <div className="col-span-12 lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-scroll-slide-group>
                  {EnhancedFeatures.map((feature, index) => (
                    <div key={index} className="flex flex-col items-center text-center p-6" data-scroll-slide-in>
                      <div className="mb-4 w-16 h-16 rounded-2xl flex items-center justify-center bg-[#0f0f0f]">
                        <InlineIcon
                          icon={feature.icon}
                          className="w-8 h-8 text-p2blue-500"
                        />
                      </div>
                      <h4 className="text-white mb-3">{feature.title}</h4>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Empty space for graphic - 4 columns */}
              <div className="hidden lg:grid col-span-4 place-items-center">
                <img
                  src="/img/keycloak-modern-app-reqs.svg"
                  alt="Modern application requirements illustration"
                  className="w-full max-w-[380px] h-auto"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>
        

        {/* Operate at Scale */}
        <section className="homepage-section cta-section-radial-pattern">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[560px] text-center mb-12" data-scroll-slide-group>
              <h2 id="adminPortal" className="text-white mb-4" data-scroll-slide-in>
                Operate at Scale with Ease
              </h2>
              <p className="text-gray-300" data-scroll-slide-in>
                Open-source means you can deploy it yourself, but does not mean you necessarily should. Our deployments stay up and perform well, with no concern by your team members about performance or uptime.
              </p>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-12 gap-6 mt-16 items-center">
              {/* Empty space for graphic - 4 columns (left side) */}
              <div className="hidden lg:grid col-span-4 place-items-center">
                <img
                  src="/img/keycloak-operate-at-scale.svg"
                  alt="Operate at scale illustration"
                  className="w-full max-w-[380px] h-auto"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              {/* Features Grid - 8 columns (right side) */}
              <div className="col-span-12 lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-scroll-slide-group>
                  {ScaleFeatures.map((feature, index) => (
                    <div key={index} className="flex flex-col items-center text-center p-6" data-scroll-slide-in>
                      <div className="mb-4 w-16 h-16 rounded-2xl flex items-center justify-center bg-[#0f0f0f]">
                        <InlineIcon
                          icon={feature.icon}
                          className="w-8 h-8 text-p2blue-500"
                        />
                      </div>
                      <h4 className="text-white mb-3">{feature.title}</h4>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* PhaseTwo Loves Keycoak */}
        <div className={`contentBlock ${styles.phaseTwoSection}`}>
          <div className={`contentBlockHead`}>
            <div data-scroll-slide-group>
              <h2 id="phaseTwoLovesKeycloak" data-scroll-slide-in>
                Phase Two{" "}
                <img
                  className={styles.heart}
                  src="img/heart-filled.svg"
                  alt="Heart symbols"
                  loading="lazy"
                />{" "}
                Keycloak
              </h2>
              <p data-scroll-slide-in>
                Phase Two is built and run by active Keycloak community contributors and authors of the most popular Keycloak extensions. We sponsor the Keycloak projects we believe in. We believe in Keycloak as a viable alternative to any existing commercial offering. 
              </p>
            </div>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.keycloakButton}>
              <Link to="/docs/introduction">
                <button className="btnSecondary">Go to Documentation</button>
              </Link>
            </div>

            <div className={styles.featCards}>
              <div className={styles.featCard}>
                <div className={styles.featCardInner}>
                  <div className={styles.featCardIcon}>
                    <InlineIcon
                      icon="lucide:code-2"
                      className={styles.featCardLucideIcon}
                    />
                  </div>
                  <div className={styles.featCardContent}>
                    <h4>Always Open Source</h4>
                    <p>
                      Phase Two is built as a collection of open source Keycloak
                      extensions. While we endeavor to make Keycloak simple to use,
                      operate and scale, in the cloud or on prem.
                    </p>
                  </div>
                </div>
              </div>
              <div className={styles.featCard}>
                <div className={styles.featCardInner}>
                  <div className={styles.featCardIcon}>
                    <InlineIcon
                      icon="lucide:shield-check"
                      className={styles.featCardLucideIcon}
                    />
                  </div>
                  <div className={styles.featCardContent}>
                    <h4>Battle-tested and hardened</h4>
                    <p>
                      Keycloak has been battle-tested and hardened for over 7 years.
                      Its security and reliability is depended on by organizations
                      from small startups to governments and Fortune 500 companies.
                    </p>
                  </div>
                </div>
              </div>
              <div className={styles.featCard}>
                <div className={styles.featCardInner}>
                  <div className={styles.featCardIcon}>
                    <InlineIcon
                      icon="lucide:users"
                      className={styles.featCardLucideIcon}
                    />
                  </div>
                  <div className={styles.featCardContent}>
                    <h4>Community Superpower</h4>
                    <p>
                      We believe that community participation in building our
                      software is a superpower, and can't wait to see what you will
                      help us build.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <StartYourJourney />
      </main>
    </Layout>
  );
}

export default Home;
