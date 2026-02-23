import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import CardWithImage from "../../components/CardWithImage";

const PAGE_META = {
  title: "Identity Provider",
  description:
    "Identity - Authentication with Social Login, Multi-factor, Passwordless, Magic links and more. User self-management with a user account portal",
};

const HERO = {
  title: "Frictionless, Customized, Cost-Effective Authentication",
  description:
    "Securely authenticate users across every application with flexible, branded login experiences—without building a maze of edge-case flows.",
  imageSrc: "/img/hero-identity.svg",
  primaryCtaLabel: "Get Started",
  primaryCtaHref: "https://dash.phasetwo.io/",
  secondaryCtaLabel: "Learn more",
  secondaryCtaHref: "#features",
};

const INTRO = {
  headline:
    "Phase Two gives you customizable authentication flows that match your product and your requirements. From first sign-in to account recovery, you get a complete set of login paths—without the ongoing maintenance burden of a custom solution.",
};

const FEATURES = {
  title: "Authentication Features",
  intro:
    "Everything you need to deliver secure login, reduce friction, and support modern authentication across your applications.",
  cards: [
    {
      title: "Social Login or Corporate IDPs",
      description:
        "Offer social login (Google, GitHub, Facebook) or connect customer-managed corporate identity providers—so users sign in with the identity they already use.",
      imageSrc: "/img/social-login-or-corp-idp.svg",
    },
    {
      title: "Multi-Factor Authentication",
      description:
        "Add strong second factors with TOTP apps and WebAuthn security keys, including passkeys, for higher-assurance authentication.",
      imageSrc: "/img/multi-factor-auth.svg",
    },
    {
      title: "Magic Links, Passwordless Login",
      description:
        "Let users sign in with emailed magic links for a fast, secure passwordless experience—no passwords to reset or reuse.",
      imageSrc: "/img/magic-links.svg",
    },
    {
      title: "User Account Management",
      description:
        "Give users a self-service account portal to manage profile and security settings—reducing common support requests.",
      imageSrc: "/img/user-account-management.svg",
    },
    {
      title: "Cost Effective Authentication",
      description:
        "Keep costs predictable as you scale: Phase Two doesn’t charge based on user counts or login methods.",
      imageSrc: "/img/cost-effective-auth.svg",
    },
    {
      title: "Passkeys",
      description: "Adopt modern passkeys for phishing-resistant, passwordless authentication with maximum security.",
      imageSrc: "/img/passkeys.svg",
    },
  ],
};

const MAGIC_LINK_GUIDE_URL = "/blog/set-up-magic-links";

function SectionHeading({ title, intro, align = "center" }) {
  return (
    <div className={align === "center" ? "text-center" : "subpage-section-heading"}>
      <h2 className="text-white">{title}</h2>
      {intro ? <p className="mt-6 text-gray-300 subpage-section-intro">{intro}</p> : null}
    </div>
  );
}

function Identity() {
  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div
            className="relative isolate overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 40%, transparent) 0%, transparent 100%)",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="hero-box-image mb-6">
                  <img
                    src={HERO.imageSrc}
                    alt=""
                    className="hero-box-image-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <h1 className="text-white text-balance">{HERO.title}</h1>
                <p className="mt-6 text-gray-300 text--body-large whitespace-pre-line mb-0">
                  {HERO.description}
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a href={HERO.primaryCtaHref} target="_blank" rel="noreferrer">
                    <button className="btnPrimary min-w-[160px]">{HERO.primaryCtaLabel}</button>
                  </a>
                  <Link href={HERO.secondaryCtaHref} className="link-primary">
                    {HERO.secondaryCtaLabel} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)] text-center">
              <h3 className="mb-0 text-gray-300 font-normal text-balance whitespace-pre-line">
                {INTRO.headline}
              </h3>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={FEATURES.title} intro={FEATURES.intro} />

            <div className="mx-auto mt-14 max-w-[var(--content-width-wide)] space-y-6">
              {FEATURES.cards.slice(0, 1).map((card) => (
                <CardWithImage
                  key={card.title}
                  layout="horizontal"
                  imagePosition="left"
                  titleAs="h3"
                  title={card.title}
                  description={<p className="mb-0">{card.description}</p>}
                  imageSrc={card.imageSrc}
                  imageAlt=""
                />
              ))}
            </div>

            <div className="mx-auto mt-6 grid max-w-[var(--content-width-wide)] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.cards.slice(1).map((card) => (
                <CardWithImage
                  key={card.title}
                  title={card.title}
                  description={<p className="mb-0">{card.description}</p>}
                  imageSrc={card.imageSrc}
                  imageAlt=""
                />
              ))}
            </div>

            <p className="mt-10 mb-0 text-gray-300 text--body-large text-center text-balance">
              Want a quick way to ship passwordless login? Read our{" "}
              <Link to={MAGIC_LINK_GUIDE_URL} className="link-primary">
                Magic Link guide
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Identity;
