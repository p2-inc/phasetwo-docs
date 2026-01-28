import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import React from "react";
import { InlineIcon } from "@iconify/react";
import CardWithIcon from "../../components/CardWithIcon";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const PLACEHOLDER_IMG = "/img/placeholder.svg";
const HERO_IMG = "/img/hero-configure.svg";
const SECURITY_IMG = "/img/ip-based-security.svg";

const securityControls = [
  {
    title: "Network restrictions",
    description:
      "Restrict access to your deployment and management interfaces using allowlists and network controls.",
    icon: "lucide:shield",
  },
  {
    title: "Lock down admin access",
    description:
      "Reduce risk by limiting privileged access and keeping operational surfaces private by default.",
    icon: "lucide:lock",
  },
  {
    title: "Audit-friendly posture",
    description:
      "Security-focused defaults and clear controls help you meet internal and external compliance expectations.",
    icon: "lucide:file-check-2",
  },
];

const themingOptions = [
  {
    title: "Custom domains",
    description:
      "Bring your own domain so users see a consistent URL and a more trusted login experience.",
    icon: "lucide:globe",
  },
  {
    title: "Custom themes",
    description:
      "Upload and manage themes so your login and account screens match your product branding.",
    icon: "lucide:palette",
  },
];

const extensionOptions = [
  {
    title: "Bring your own extensions",
    description:
      "Have a custom provider or SPI? We can help you deploy and operate it safely on managed infrastructure.",
    icon: "lucide:plug",
  },
  {
    title: "Dedicated customization",
    description:
      "Need something purpose-built? Work with our team to design, implement, and maintain custom extensions.",
    icon: "lucide:wrench",
  },
];

export default function Configure() {
  return (
    <Layout
      title="Configure"
      description="Control and configure your Keycloak deployment with practical security controls, theming, and extension-ready infrastructure."
    >
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
              <div className="mx-auto max-w-2xl text-center">
                <div className="hero-box-image mb-6">
                  <img
                    src={HERO_IMG}
                    alt=""
                    className="hero-box-image-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h1 className="text-white">Control and Configure Your Keycloak Deployment</h1>
                <p className="mt-6 text-gray-300">
                  Tools for managing your cluster with security controls, branding options, and
                  extension-ready infrastructure—without the operational burden.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a href="https://dash.phasetwo.io/" target="_blank" rel="noreferrer">
                    <button className="btnPrimary min-w-[160px]">Try for Free</button>
                  </a>
                  <Link href="#security" className="link-primary">
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">Tightly Controlled Security</h2>
              <p className="mt-6 text-gray-300 subpage-section-intro">
                Tighten the screws around your Keycloak deployment with practical, production-first
                controls.
              </p>
            </div>

            <div className="mx-auto mt-10 flex max-w-[var(--content-width-narrow)] items-center justify-center">
              <img
                src={SECURITY_IMG}
                alt=""
                className="w-full max-w-[520px] h-auto"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="mx-auto mt-14 grid max-w-[var(--content-width-narrow)] grid-cols-1 gap-10 lg:grid-cols-10 lg:gap-14">
              <div className="text-gray-300 lg:col-span-4">
                <p className="mb-6 text--body-large">
                  Apply consistent security posture across your environments without inventing new
                  tooling. Keep sensitive interfaces protected and reduce exposure while staying
                  operationally efficient.
                </p>
                <p className="mb-0">
                  Whether you need to satisfy internal requirements or external audits, the goal is
                  the same: make the secure path the easy path.
                </p>
              </div>

              <div className="lg:col-span-6">
                <div className="flex flex-col gap-4">
                  {securityControls.map((item) => (
                    <CardWithIcon
                      key={item.title}
                      layout="horizontal"
                      icon={
                        <InlineIcon
                          icon={item.icon}
                          className="size-8 text-sky-300 icon-stroke [&_*]:fill-none [&_*]:stroke-current"
                          aria-hidden="true"
                        />
                      }
                      iconAlt=""
                      heading={item.title}
                      description={item.description}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Theming */}
        <section id="theming" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">Make It Your Own</h2>
              <p className="mt-6 text-gray-300 subpage-section-intro">
                Customize your deployment so it looks and feels like your product—especially at the
                moments that matter most: login and account management.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-[var(--content-width-narrow)] grid-cols-1 gap-5 md:grid-cols-2">
              {themingOptions.map((item) => (
                <CardWithIcon
                  key={item.title}
                  icon={
                    <InlineIcon
                      icon={item.icon}
                      className="size-8 text-sky-300 icon-stroke [&_*]:fill-none [&_*]:stroke-current"
                      aria-hidden="true"
                    />
                  }
                  iconAlt=""
                  heading={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Extending */}
        <section id="extending" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">Extend It Any Way You Want</h2>
              <p className="mt-6 text-gray-300 subpage-section-intro">
                Need more than “vanilla” Keycloak? Add what you need—providers, SPIs, and custom
                functionality—without taking on all the operational complexity yourself.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-[var(--content-width-narrow)] grid-cols-1 gap-10 md:grid-cols-2 md:gap-8">
              {extensionOptions.map((item) => (
                <CardWithIcon
                  key={item.title}
                  variant="light"
                  icon={
                    <InlineIcon
                      icon={item.icon}
                      className="size-8 icon-stroke [&_*]:fill-none [&_*]:stroke-current"
                      aria-hidden="true"
                    />
                  }
                  iconAlt=""
                  heading={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <Cta
          sectionClassName="subpage-section cta-section-gradient"
          background="primary"
          primaryText="Ready to Try Keycloak?"
          secondaryText="Create Your Free Deployment Today."
          showCta
          ctaLabel="Try for Free"
          ctaHref="https://dash.phasetwo.io/"
        />
      </main>
    </Layout>
  );
}
