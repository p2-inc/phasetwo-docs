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
const EXTERNAL_LINK_ICON_CLASS = "size-4 [&_*]:fill-none [&_*]:stroke-current";

const CONTACT_ITEMS = [
  {
    icon: "lucide:monitor",
    title: "Technical support (customers)",
    description:
      "Issues or problems with hosting or support? If you have a service portal, please use that for fastest escalation.",
    actions: [
      {
        href: "https://help.phasetwo.io",
        label: "help.phasetwo.io",
        external: true,
        showExternalIcon: true,
      },
      {
        href: "mailto:support@phasetwo.io",
        label: "support@phasetwo.io",
      },
    ],
  },
  {
    icon: "lucide:alert-triangle",
    iconVariant: "secondary",
    title: "Emergency Keycloak Assistance",
    description:
      "If you are experiencing an outage or critical issue, related to Keycloak, and want to engage Phase Two services.",
    actions: [
      {
        href: "mailto:support@phasetwo.io",
        label: "support@phasetwo.io",
      },
    ],
  },
  {
    icon: "lucide:message-circle",
    title: "Sales",
    description: "We keep it simple with email. We respond quick.",
    actions: [
      {
        href: "mailto:sales@phasetwo.io",
        label: "sales@phasetwo.io",
      },
    ],
  },
  {
    id: "rfps",
    icon: "lucide:file-text",
    title: "Request for Proposals (RFPs)",
    description:
      "Send RFPs, procurement requirements, and vendor review requests directly to our sales team.",
    actions: [
      {
        href: "mailto:sales@phasetwo.io",
        label: "sales@phasetwo.io",
      },
    ],
  },
  {
    icon: "lucide:badge-check",
    title: "Certifications",
    description:
      "Review our SOC 2 Type 2 and ISO 27001 certifications, along with related security and compliance information, in our Trust Center.",
    actions: [
      {
        href: "https://trust.phasetwo.io",
        label: "trust.phasetwo.io",
        external: true,
        showExternalIcon: true,
      },
    ],
  },
  {
    icon: "lucide:bug",
    title: "Bug reports & Feature requests",
    description:
      "Please file on Github for issues or feature requests related to our open source projects.",
    actions: [
      {
        href: "https://github.com/p2-inc/phasetwo/issues",
        label: "Report a bug",
        external: true,
        style: "button",
      },
    ],
  },
  {
    icon: "lucide:shield-check",
    title: "Security Reports",
    description:
      "Please email us directly with any security issues. For bugs and critical issues reported, a bug bounty may be available.",
    actions: [
      {
        href: "mailto:support@phasetwo.io",
        label: "support@phasetwo.io",
      },
    ],
  },
];

function ContactAction({ action }) {
  const {
    href,
    label,
    external = false,
    showExternalIcon = false,
    style = "link",
  } = action;
  const className =
    style === "button"
      ? "btnSecondary no-underline inline-flex items-center justify-center w-fit"
      : showExternalIcon
        ? "link-primary no-underline inline-flex items-center gap-1"
        : "link-primary no-underline";

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={className}
    >
      {label}
      {showExternalIcon ? (
        <InlineIcon
          icon="lucide:external-link"
          className={EXTERNAL_LINK_ICON_CLASS}
        />
      ) : null}
    </a>
  );
}

function ContactActions({ actions }) {
  if (!actions?.length) {
    return null;
  }

  if (actions.length === 1) {
    return <ContactAction action={actions[0]} />;
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      {actions.map((action) => (
        <ContactAction key={action.href} action={action} />
      ))}
    </div>
  );
}

function ContactCard({
  id,
  icon,
  title,
  description,
  actions,
  iconVariant = "primary",
}) {
  const iconClass =
    iconVariant === "secondary" ? ICON_CLASS_SECONDARY : ICON_CLASS_PRIMARY;
  return (
    <div
      id={id}
      className="hosting-bento-box flex h-full scroll-mt-24 flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-row gap-6 md:min-h-[140px]">
        <div className="flex size-10 shrink-0 items-center justify-center">
          <InlineIcon aria-hidden="true" className={iconClass} icon={icon} />
        </div>
        <div className="hosting-bento-content flex min-w-0 flex-1 flex-col">
          <h4 className="mb-3 text-white">{title}</h4>
          <div className="hosting-bento-text flex-1 text-gray-300">
            <p className="mb-0">{description}</p>
          </div>
        </div>
      </div>
      <div
        className="contact-links contact-card-actions -mx-8 mt-4 flex flex-col justify-start gap-2 border-t px-8 pt-4 md:min-h-[72px] md:flex-row md:items-center"
        style={{ borderColor: "var(--line-color)" }}
      >
        <ContactActions actions={actions} />
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
          <div
            className="relative isolate overflow-hidden"
            style={HERO_BG_STYLE}
          >
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-balance text-white">Contact Phase Two</h1>
                <p className="text--body-large contact-links mb-0 mt-6 text-gray-300">
                  Get in touch with us for help with support, sales, or bug
                  reports. For customers experiencing an outage, please{" "}
                  <a
                    href="mailto:support@phasetwo.io"
                    className="link-primary no-underline"
                  >
                    email
                  </a>
                  , call the support number, or use your customer service
                  portal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact cards */}
        <section className="subpage-section texture-plus py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {CONTACT_ITEMS.map((item) => (
                <ContactCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
