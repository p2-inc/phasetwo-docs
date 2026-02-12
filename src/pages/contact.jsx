import { InlineIcon } from "@iconify/react";
import Layout from "@theme/Layout";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const ICON_CLASS_PRIMARY =
  "size-8 text-[var(--ifm-color-primary)] icon-stroke [&_*]:fill-none [&_*]:stroke-current";
const ICON_CLASS_SECONDARY =
  "size-8 text-[var(--ifm-color-secondary)] icon-stroke [&_*]:fill-none [&_*]:stroke-current";

function ContactCard({ icon, title, description, action, iconVariant = "primary" }) {
  const iconClass = iconVariant === "secondary" ? ICON_CLASS_SECONDARY : ICON_CLASS_PRIMARY;
  return (
    <div className="hosting-bento-box flex flex-col h-full">
      <div className="flex flex-row gap-6 flex-1 min-h-0 md:min-h-[140px]">
        <div className="flex size-10 shrink-0 items-center justify-center">
          <InlineIcon aria-hidden="true" className={iconClass} icon={icon} />
        </div>
        <div className="hosting-bento-content flex-1 min-w-0 flex flex-col">
          <h4 className="text-white mb-3">{title}</h4>
          <div className="text-gray-300 hosting-bento-text flex-1">{description}</div>
        </div>
      </div>
      <div
        className="contact-links contact-card-actions pt-4 mt-4 -mx-8 px-8 border-t flex flex-col md:flex-row md:items-center justify-start gap-2 md:min-h-[72px]"
        style={{ borderColor: "var(--line-color)" }}
      >
        {action}
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <Layout
      title="Contact"
      description="Contact Phase Two for help with support, sales, or bug reports."
    >
      <main className="hosting-page contact-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div className="relative isolate overflow-hidden" style={HERO_BG_STYLE}>
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-white text-balance">Contact Phase Two</h1>
                <p className="mt-6 text-gray-300 text--body-large mb-0 contact-links">
                  Get in touch with us for help with support, sales, or bug
                  reports. For customers experiencing an outage, please{" "}
                  <a href="mailto:support@phasetwo.io" className="link-primary no-underline">email</a>, call the support
                  number, or use your customer service portal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact cards */}
        <section className="subpage-section texture-plus py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <ContactCard
                icon="lucide:monitor"
                title="Technical support (customers)"
                description={
                  <p className="mb-0">
                    Issues or problems with hosting or support? If you have a
                    service portal, please use that for fastest escalation.
                  </p>
                }
                action={
                  <div className="flex flex-wrap items-center gap-5">
                    <a
                      href="https://help.phasetwo.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-primary no-underline inline-flex items-center gap-1"
                    >
                      help.phasetwo.io{" "}
                      <InlineIcon
                        icon="lucide:external-link"
                        className="size-4 [&_*]:fill-none [&_*]:stroke-current"
                      />
                    </a>
                    <a href="mailto:support@phasetwo.io" className="link-primary no-underline">
                      support@phasetwo.io
                    </a>
                  </div>
                }
              />

              <ContactCard
                icon="lucide:alert-triangle"
                iconVariant="secondary"
                title="Emergency Keycloak Assistance"
                description={
                  <p className="mb-0">
                    If you are experiencing an outage or critical issue, related to
                    Keycloak, and want to engage Phase Two services.
                  </p>
                }
                action={
                  <a href="mailto:support@phasetwo.io" className="link-primary no-underline">
                    support@phasetwo.io
                  </a>
                }
              />

              <ContactCard
                icon="lucide:message-circle"
                title="Sales"
                description={
                  <p className="mb-0">
                    We keep it simple with email. We respond quick.
                  </p>
                }
                action={
                  <a href="mailto:sales@phasetwo.io" className="link-primary no-underline">
                    sales@phasetwo.io
                  </a>
                }
              />

              <ContactCard
                icon="lucide:bug"
                title="Bug reports &amp; Feature requests"
                description={
                  <p className="mb-0">
                    Please file on Github for issues or feature requests related to
                    our open source projects.
                  </p>
                }
                action={
                  <a
                    href="https://github.com/p2-inc/phasetwo/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btnSecondary no-underline inline-flex items-center justify-center w-fit"
                  >
                    Report a bug
                  </a>
                }
              />

              <ContactCard
                icon="lucide:shield-check"
                title="Security Reports"
                description={
                  <p className="mb-0">
                    Please email us directly with any security issues. For bugs and
                    critical issues reported, a bug bounty may be available.
                  </p>
                }
                action={
                  <a href="mailto:support@phasetwo.io" className="link-primary no-underline">
                    support@phasetwo.io
                  </a>
                }
              />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
