import Link from "@docusaurus/Link";
import { InlineIcon } from "@iconify/react";
import Layout from "@theme/Layout";
import React from "react";
import IconQuestionMarkCircle from "@site/static/img/icon-question-mark-circle.svg";
import BackupIllustration from "@site/static/img/backup.svg";
import CardWithIcon from "../../components/CardWithIcon";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const updateChallenges = [
  {
    title: "Breaking changes + regressions",
    description:
      "Major releases can introduce breaking changes. It’s hard to predict what will impact your instance and customizations.",
  },
  {
    title: "Security patch pressure",
    description:
      "Delaying upgrades increases risk. But rushing upgrades can introduce instability when you don’t have time to test thoroughly.",
  },
  {
    title: "Operational overhead",
    description:
      "Upgrades become a recurring project: release notes, testing, rollout plans, rollbacks, and stakeholder coordination—every time.",
  },
];

const updateSolutionCards = [
  {
    title: "Upgrade requiring downtime?",
    description:
      "We plan and execute upgrades to minimize risk and disruption—so your team doesn’t have to treat every release like a migration project.",
    icon: "lucide:circle-arrow-up",
  },
  {
    title: "Off-hours upgrades",
    description:
      "Prefer upgrades at night or during low traffic windows? We coordinate the rollout to fit your operational needs.",
    icon: "lucide:moon",
  },
];

const backupItems = [
  {
    title: "Automated backups",
    description:
      "Routine backups are built into every managed deployment so you always have recovery points when you need them.",
    icon: "lucide:database-backup",
  },
  {
    title: "Cross-region durability",
    description:
      "Backups are stored durably and designed to support recovery even when infrastructure incidents happen.",
    icon: "lucide:globe",
  },
  {
    title: "Assisted restore",
    description:
      "Need help restoring? Our team supports recovery workflows so you can get back online quickly and confidently.",
    icon: "lucide:life-buoy",
  },
];

export default function Support() {
  return (
    <Layout
      title="Support"
      description="Tools that make managing your Keycloak instance easy and repeatable."
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
                <h1 className="text-white">Support</h1>
                <p className="mt-6 text-gray-300">
                  Tools that make managing your Keycloak instance easy and
                  repeatable.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a
                    href="https://dash.phasetwo.io/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button className="btnPrimary min-w-[160px]">
                      Try for Free
                    </button>
                  </a>
                  <Link href="#update-challenges" className="link-primary">
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Update Challenges */}
        <section id="update-challenges" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">Update Challenges</h2>
              <p className="mt-6 text-gray-300 subpage-section-intro">
                It can be hard managing Keycloak updates, particularly when
                you’re trying to balance security, stability, and time.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-[var(--content-width-narrow)] grid-cols-1 gap-10 lg:grid-cols-10 lg:gap-14">
              <div className="text-gray-300 lg:col-span-4">
                <p className="mb-6 text--body-large">
                  Managing Keycloak upgrades can be scary. Knowing what changed, what might break, and how to validate everything takes real time—especially when your team is focused on shipping product.
                </p>
                <p className="mb-0">
                  When updates pile up, it becomes easy to fall behind. That’s when security patches feel urgent, releases feel risky, and the upgrade process becomes a recurring fire drill.
                </p>
              </div>

              <div className="flex flex-col gap-4 lg:col-span-6">
                {updateChallenges.map((c) => (
                  <CardWithIcon
                    key={c.title}
                    layout="horizontal"
                    icon={
                      <IconQuestionMarkCircle
                        aria-hidden="true"
                        className="size-5 text-red-400 [&_*]:fill-current"
                      />
                    }
                    iconAlt=""
                    heading={c.title}
                    description={c.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Update Solution */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">Always Up-To-Date</h2>
              <p className="mt-6 text-gray-300 subpage-section-intro">
                Enjoy rapid updates and stop fearing upgrades to your Keycloak deployment.
              </p>
            </div>

            <div className="mx-auto mt-12 flex max-w-[var(--content-width-narrow)] flex-col items-center">
              <div className="flex items-center justify-center">
                <BackupIllustration
                  aria-hidden="true"
                  className="w-full max-w-[220px] h-auto"
                />
              </div>

              <h3 className="mt-10 text-white text-center text-balance">
                Phase Two customers are always within a couple of minor versions
                of mainline Keycloak.
              </h3>

              <div className="mt-10 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
                {updateSolutionCards.map((card) => (
                  <CardWithIcon
                    key={card.title}
                    icon={
                      <InlineIcon
                        icon={card.icon}
                        className="size-6 text-sky-300"
                        aria-hidden="true"
                      />
                    }
                    iconAlt=""
                    layout="horizontal"
                    heading={card.title}
                    description={card.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Backup */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)] text-center">
              <h2 className="text-white">Backup: A Peace of Mind</h2>
            </div>

            <div className="mx-auto mt-12 grid max-w-[var(--content-width-narrow)] grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
              {backupItems.map((item) => (
                <CardWithIcon
                  key={item.title}
                  variant="light"
                  icon={<InlineIcon icon={item.icon} className="size-6" aria-hidden="true" />}
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
