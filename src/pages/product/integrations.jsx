import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import styles from "./integrations.module.css";
import { useState } from "react";
import FrameworkTabs from "../../components/FrameworkTabs";
import pageStyles from "../styles.module.css";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const PAGE_CTA = {
  primaryText: "Ready to Try Keycloak?",
  secondaryText: "Create Your Free Deployment Today.",
  ctaLabel: "Try for Free",
  ctaHref: "https://dash.phasetwo.io/",
};

function iconifyImgSrc(icon, { color = "#fff" } = {}) {
  // Use Iconify's static SVG endpoint so we can render icons with <img>
  // and keep the tile structure consistent with the homepage.
  return `https://api.iconify.design/${icon}.svg?color=${encodeURIComponent(color)}`;
}

function Integrations() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Layout
      title="Integrations"
      description="Easily integrate Phase Two with many identity providers and application frameworks."
    >
      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div className="relative isolate overflow-hidden" style={HERO_BG_STYLE}>
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-white text-balance">
                  Integrate with Existing Identity Providers and Frameworks
                </h1>
                <p className="mt-6 text-gray-300 text--body-large text-balance mb-0">
                  Set up Phase Two to work with your existing identity provider
                  which can include any social login, SAML, or OAuth provider. We
                  also provide SDKs for popular application frameworks.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a href="mailto:support@phasetwo.io">
                    <button className="btnPrimary min-w-[160px]">
                      Contact Sales
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <FrameworkTabs
              tabs={[
                { key: "protocols", label: "Protocols" },
                { key: "idps", label: "Identity Providers" },
                { key: "frameworks", label: "Frameworks" },
              ]}
              activeIndex={activeTab}
              onChange={setActiveTab}
              panels={[
                <div key="protocols" className="framework-tab-panel">
                  <div className="mx-auto max-w-[var(--content-width-narrow)] text-center">
                    <p className="mt-6 text-gray-300 subpage-section-intro mb-0">
                      Phase Two supports the most common protocols for seamless
                      integration with <b>any system</b>.
                    </p>
                  </div>

                  <div className="mt-10 flex justify-center">
                    <div className={pageStyles.engLogoGrid} role="list">
                      {[
                        { src: "/img/saml.svg", alt: "SAML", className: styles.logoImgWide },
                        { src: "/img/openid.svg", alt: "OpenID", className: styles.logoImgWide },
                      ].map((logo) => (
                        <div key={logo.alt} className={pageStyles.engLogoTile} role="listitem">
                          <img
                            src={logo.src}
                            alt={logo.alt}
                            className={logo.className}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>,

                <div key="idps" className="framework-tab-panel">
                  <div className="mx-auto max-w-[var(--content-width-narrow)] text-center">
                    <p className="mt-6 text-gray-300 subpage-section-intro mb-0">
                      Phase Two works out of the box with all of the following
                      Identity Providers and enables all{" "}
                      <Link to="/product/organizations" className="link-primary">
                        Organization
                      </Link>{" "}
                      admins to set up configured their chosen Identity
                      Providers using the{" "}
                      <Link to="/product/adminportal/" className="link-primary">
                        Admin Portal
                      </Link>
                      .
                    </p>
                  </div>

                  <div className="mt-10 flex justify-center">
                    <div className={pageStyles.engLogoGrid} role="list">
                      {[
                        { icon: "fa-brands:bitbucket", alt: "Bitbucket" },
                        { icon: "fa-brands:facebook", alt: "Facebook" },
                        { icon: "fa-brands:github", alt: "Github" },
                        { icon: "fa-brands:gitlab", alt: "Gitlab" },
                        { icon: "fa-brands:google", alt: "Google" },
                        { icon: "fa-brands:instagram", alt: "Instagram" },
                        { icon: "fa-brands:linkedin", alt: "LinkedIn" },
                        { icon: "fa-brands:microsoft", alt: "Microsoft" },
                        { src: "/img/logo-azure.svg", alt: "Azure", className: styles.logoImgWide },
                        { icon: "carbon:logo-openshift", alt: "Openshift" },
                        { icon: "fa-brands:paypal", alt: "Paypal" },
                        { icon: "fa-brands:stack-overflow", alt: "StackOverflow" },
                        { icon: "fa6-brands:x-twitter", alt: "X" },
                        { src: "/img/logo-onelogin.svg", alt: "Onelogin", className: styles.logoImgWide },
                        { src: "/img/logo-adfs.svg", alt: "ADFS", className: styles.logoImgWide },
                        { src: "/img/logo-ping-identity.svg", alt: "PingIdentity", className: styles.logoImgWide },
                        { src: "/img/logo-duo-security.svg", alt: "DUO", className: styles.logoImgWide },
                        { src: "/img/logo-jumpcloud-logo.svg", alt: "JumpCloud", className: styles.logoImgWide },
                      ].map((logo) => (
                        <div key={logo.alt} className={pageStyles.engLogoTile} role="listitem">
                          <img
                            src={logo.src ?? iconifyImgSrc(logo.icon)}
                            alt={logo.alt}
                            className={logo.className ?? pageStyles.engLogoImg}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>,

                <div key="frameworks" className="framework-tab-panel">
                  <div className="mx-auto max-w-[var(--content-width-narrow)] text-center">
                    <p className="mt-6 text-gray-300 subpage-section-intro mb-0">
                      Phase Two can secure{" "}
                      <a
                        href="https://phasetwo.io/docs/securing-applications/"
                        className="link-primary"
                      >
                        web frameworks
                      </a>{" "}
                      or native applications to provide authentication and
                      authorization services.
                    </p>
                  </div>

                  <div className="mt-10 flex justify-center">
                    <div className={pageStyles.engLogoGrid} role="list">
                      {[
                        {
                          href: "https://phasetwo.io/docs/securing-applications/django",
                          title: "Django",
                          src: "/eng-logos/django.svg",
                          alt: "Django",
                        },
                        {
                          href: "https://phasetwo.io/docs/securing-applications/springboot",
                          title: "Spring Boot",
                          src: "/eng-logos/spring.svg",
                          alt: "Spring",
                        },
                        {
                          href: "https://phasetwo.io/docs/securing-applications/javascript",
                          title: "Javascript",
                          src: "/eng-logos/js.svg",
                          alt: "JavaScript",
                        },
                        { title: "nodejs", src: "/eng-logos/nodejs.svg", alt: "Node.js" },
                        {
                          href: "https://phasetwo.io/docs/securing-applications/react",
                          title: "React",
                          src: "/eng-logos/react.svg",
                          alt: "React",
                        },
                        {
                          href: "https://phasetwo.io/docs/securing-applications/next",
                          title: "Next.js",
                          src: "/eng-logos/nextjs.svg",
                          alt: "Next.js",
                        },
                        {
                          href: "https://phasetwo.io/docs/securing-applications/vue",
                          title: "Vue",
                          src: "/eng-logos/vue.svg",
                          alt: "Vue",
                        },
                        {
                          href: "https://phasetwo.io/docs/securing-applications/nuxt",
                          title: "Nuxt",
                          src: "/eng-logos/nuxtjs.svg",
                          alt: "Nuxt",
                        },
                        {
                          href: "https://phasetwo.io/docs/securing-applications/remix",
                          title: "Remix",
                          src: "/eng-logos/remix.svg",
                          alt: "Remix",
                        },
                        {
                          href: "https://phasetwo.io/docs/securing-applications/sveltekit",
                          title: "Sveltekit",
                          src: "/eng-logos/svelte.svg",
                          alt: "Svelte",
                        },
                        {
                          href: "https://phasetwo.io/docs/securing-applications/angular",
                          title: "Angular",
                          src: "/eng-logos/angular.svg",
                          alt: "Angular",
                        },
                        { title: "GoLang", src: "/eng-logos/go.svg", alt: "Go" },
                        { title: "Android", src: "/eng-logos/android.svg", alt: "Android" },
                        { title: "Apple", src: "/eng-logos/apple.svg", alt: "Apple" },
                        { title: "php", src: "/eng-logos/php.svg", alt: "PHP" },
                        { title: "c#", src: "/eng-logos/csharp.svg", alt: "C#" },
                      ].map((logo) => {
                        const tile = (
                          <div className={pageStyles.engLogoTile} role="listitem">
                            <img
                              src={logo.src}
                              alt={logo.alt}
                              className={pageStyles.engLogoImg}
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        );

                        return logo.href ? (
                          <a key={logo.title} href={logo.href} title={logo.title}>
                            {tile}
                          </a>
                        ) : (
                          <div key={logo.title} title={logo.title}>
                            {tile}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>,
              ]}
            />
          </div>
        </section>

        {/* CTA */}
        <Cta
          sectionClassName="subpage-section cta-section-gradient"
          background="primary"
          primaryText={PAGE_CTA.primaryText}
          secondaryText={PAGE_CTA.secondaryText}
          showCta
          ctaLabel={PAGE_CTA.ctaLabel}
          ctaHref={PAGE_CTA.ctaHref}
        />
      </main>
    </Layout>
  );
}

export default Integrations;
