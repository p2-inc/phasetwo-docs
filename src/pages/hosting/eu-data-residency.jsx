import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import React from "react";

import Section from "../../components/Section";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const LAST_REVIEWED = "2026-09-21";

// One row per class of data we hold. The "who can reach it" column is the point
// of this page: storing data in the EU and reaching it from outside the EU are
// two different statements, and a page that only makes the first one is not
// answering the question a data protection officer is actually asking.
const DATA_MAP = [
  {
    data: "Keycloak database — users, credentials, groups, roles, client config",
    stored: "Frankfurt (eu-central-1)",
    provider: "AWS, Germany",
    access: "Phase Two operations staff, including staff outside the EU",
    leaves: "Never replicated outside the EU",
  },
  {
    data: "Sessions and cache",
    stored: "Frankfurt (eu-central-1)",
    provider: "AWS, Germany",
    access: "Phase Two operations staff, including staff outside the EU",
    leaves: "Never replicated outside the EU",
  },
  {
    data: "Event store — login and admin events",
    stored: "Frankfurt (eu-central-1)",
    provider: "AWS, Germany",
    access: "Phase Two operations staff, including staff outside the EU",
    leaves: "Never replicated outside the EU",
  },
  {
    data: "Backups",
    stored: "Ireland (eu-west-1)",
    provider: "AWS, Ireland",
    access: "Phase Two operations staff, including staff outside the EU",
    leaves: "Never replicated outside the EU",
  },
  {
    data: "Encryption keys for realm signing",
    stored: "Frankfurt (eu-central-1)",
    provider: "AWS KMS, Germany",
    access: "Phase Two operations staff",
    leaves: "Never replicated outside the EU",
  },
  {
    data: "Cluster logs and metrics",
    stored: "Frankfurt (eu-central-1)",
    provider: "AWS, Germany",
    access: "Phase Two engineering, including staff outside the EU",
    leaves: "Never replicated outside the EU",
  },
  {
    data: "Dashboard account metadata — your Phase Two login, org and cluster settings",
    stored: "United States",
    provider: "See the Trust Center subprocessor list",
    access: "Phase Two staff",
    leaves: "Yes — this is not your end users' identity data",
  },
  {
    data: "Support tickets and their attachments",
    stored: "United States",
    provider: "See the Trust Center subprocessor list",
    access: "Phase Two support staff",
    leaves: "Yes — send us no end-user personal data in a ticket",
  },
  {
    data: "Billing and invoicing",
    stored: "United States",
    provider: "See the Trust Center subprocessor list",
    access: "Phase Two finance staff",
    leaves: "Yes — billing contact details only",
  },
];

const FAQS = [
  {
    q: "Is hosting in the EU enough?",
    a: "No, and we would rather say so than let you find out later. Where data is stored is one question; who can reach it, which company you contract with, and which laws that company is subject to are three more. This page answers all four, and the answer to the third and fourth involves a United States parent company. Any vendor telling you that an EU region settles the matter is selling you a simpler story than the one your data protection officer will ask for.",
  },
  {
    q: "Are you subject to the US CLOUD Act?",
    a: "Our parent company is incorporated in the United States, so we cannot claim immunity from United States legal process, and you should be sceptical of any vendor with a United States or United Kingdom parent that does. Under the CLOUD Act a provider subject to United States jurisdiction can be compelled to disclose data in its possession, custody, or control wherever that data is stored. What we can tell you is what we would do about it, which is on our government requests page, and that we have never received such a request.",
  },
  {
    q: "Can staff outside the EU access my data?",
    a: "Yes. Our control plane runs in the United States and our engineering team is distributed globally, so administrators outside the EU can reach your cluster in order to operate it. Access is limited to named roles and is logged internally. We disclose this because it is the part most vendors leave out.",
  },
  {
    q: "Is remote administrative access a transfer under the GDPR?",
    a: "Yes. Remote access to EU-stored data from outside the EU is a restricted transfer under Chapter V of the GDPR, not an exception to it. It is covered in our data processing agreement rather than left unsaid.",
  },
  {
    q: "Why do I contract with a UK company?",
    a: "Phase Two UK, Ltd is our European operating company and the contracting party for customers in the European Union and the United Kingdom. The European Commission renewed its adequacy decision for the United Kingdom on 19 December 2025, valid until 27 December 2031, so transfers from the EU to the United Kingdom need no additional safeguard.",
  },
  {
    q: "Can I choose Ireland as my primary region?",
    a: "Frankfurt is the primary region for EU clusters and Ireland holds the backups. If your requirement is specifically for an Irish primary, talk to us — it is a provisioning question, not a product limitation.",
  },
  {
    q: "Do you rely on the EU-US Data Privacy Framework?",
    a: "No. Phase Two is not certified under the Data Privacy Framework, so we do not rely on it. Transfers are handled through our data processing agreement.",
  },
  {
    q: "Can my data protection officer get the DPA without signing an NDA?",
    a: "Yes. The terms are published on our data processing page and the signature copy is available on request.",
  },
];

function Th({ children }) {
  return (
    <th
      scope="col"
      className="whitespace-nowrap px-3 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400"
    >
      {children}
    </th>
  );
}

function Td({ children, muted }) {
  return (
    <td
      className={`px-3 py-3 align-top text-[14px] ${
        muted ? "text-gray-400" : "text-gray-200"
      }`}
    >
      {children}
    </td>
  );
}

export default function EuDataResidency() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <Layout
      title="EU Data Residency for Managed Keycloak"
      description="Managed Keycloak hosted in Frankfurt with backups in Ireland, contracted through our UK company under a GDPR Article 28 agreement. Where every class of your data lives, and who can reach it."
    >
      <Head>
        <meta
          name="keywords"
          content="eu data residency, managed keycloak eu, keycloak hosting europe, keycloak gdpr, gdpr identity provider"
        />
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Head>

      <main className="hosting-page">
        {/* Hero + direct answer */}
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
                <h1 className="text-white">Your identity data stays in the EU</h1>
                <p className="text--body-large mt-6 text-gray-300">
                  Every EU cluster runs in Frankfurt with backups in Ireland. You
                  contract with Phase Two UK, Ltd under English law. Your users,
                  credentials and events are never replicated outside the EU — and
                  the administrative access that reaches them from outside the EU is
                  described on this page rather than left out of it.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a
                    href="https://dash.phasetwo.io/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button className="btnPrimary min-w-[200px]">
                      Create a Frankfurt cluster
                    </button>
                  </a>
                  <Link to="/contact/" className="link-primary">
                    Talk to us about a DPA review{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who you are dealing with */}
        <Section id="who-you-contract-with" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)]">
              <h2 className="text-white">Who you are dealing with</h2>
              <p className="mt-6 text-gray-300">
                Most pages like this one begin with certifications. We would rather
                begin with the company structure, because that is what decides which
                laws apply to your data, and because you can verify all of it.
              </p>
              <ul className="mt-6 space-y-3 text-gray-300">
                <li>
                  <strong className="text-white">
                    Phase Two UK, Ltd is the contracting party
                  </strong>{" "}
                  for customers in the European Union and the United Kingdom.
                  Registered in England and Wales, company number 16815578,
                  registered office 2 Leman Street, London E1W 9US.
                </li>
                <li>
                  <strong className="text-white">
                    Phase Two, Inc. is the parent company
                  </strong>
                  , incorporated in the United States and based in Seattle. We are a
                  remote team distributed across several countries.
                </li>
                <li>
                  <strong className="text-white">
                    Your clusters run in the EU
                  </strong>{" "}
                  — Frankfurt for everything, Ireland for backups — on infrastructure
                  operated by AWS in Germany and Ireland.
                </li>
                <li>
                  <strong className="text-white">
                    EU to UK transfers need no extra safeguard.
                  </strong>{" "}
                  The European Commission renewed its adequacy decision for the
                  United Kingdom on 19 December 2025, valid until 27 December 2031.
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* The data map */}
        <Section id="data-map" className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-white">Where every class of data lives</h2>
            <p className="mt-6 max-w-[var(--content-width-narrow)] text-gray-300">
              Your end users&rsquo; identity data stays in the EU. Our own business
              systems — the dashboard you log into, support tickets, invoicing — run
              in the United States. Both halves are below, because a table that
              showed only the first half would be the more flattering document and
              the less useful one.
            </p>

            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[840px] border-collapse">
                <thead>
                  <tr className="border-b border-white/15">
                    <Th>Data</Th>
                    <Th>Stored in</Th>
                    <Th>Infrastructure</Th>
                    <Th>Who can reach it</Th>
                    <Th>Leaves the EU?</Th>
                  </tr>
                </thead>
                <tbody>
                  {DATA_MAP.map((row) => (
                    <tr key={row.data} className="border-b border-white/10">
                      <Td>{row.data}</Td>
                      <Td>{row.stored}</Td>
                      <Td muted>{row.provider}</Td>
                      <Td muted>{row.access}</Td>
                      <Td>{row.leaves}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 max-w-[var(--content-width-narrow)] text-[14px] text-gray-400">
              The current list of subprocessors, with the service each one provides,
              is published in our{" "}
              <a
                href="https://trust.phasetwo.io/subprocessors"
                target="_blank"
                rel="noreferrer"
                className="ilink"
              >
                Trust Center
              </a>
              . We notify customers before adding one.
            </p>
          </div>
        </Section>

        {/* Jurisdiction */}
        <Section id="us-jurisdiction" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)]">
              <h2 className="text-white">
                The CLOUD Act, and administrative access from outside the EU
              </h2>
              <p className="mt-6 text-gray-300">
                Two things about the arrangement above are worth hearing from us
                rather than discovering during a procurement review.
              </p>
              <p className="mt-4 text-gray-300">
                <strong className="text-white">
                  Our parent company is incorporated in the United States.
                </strong>{" "}
                Under the US CLOUD Act a provider subject to United States
                jurisdiction can be compelled to disclose data in its
                &ldquo;possession, custody, or control&rdquo; wherever that data is
                stored. We therefore do not claim immunity from United States legal
                process, and we would encourage you to read any vendor who does
                claim it with some care — a European region does not by itself change
                where a parent company is incorporated.
              </p>
              <p className="mt-4 text-gray-300">
                <strong className="text-white">
                  Our control plane runs in the United States, and our engineers are
                  distributed globally.
                </strong>{" "}
                Administering your cluster — provisioning it, upgrading it, restoring
                it, responding at three in the morning — means reaching it, and some
                of the people doing that are outside the EU. Under Chapter V of the
                GDPR that access is a restricted transfer, not a gap in one. It is
                limited to named roles, logged internally, and covered in the{" "}
                <Link to="/company/data-processing/" className="ilink">
                  data processing agreement
                </Link>
                .
              </p>
              <p className="mt-4 text-gray-300">
                What we commit to in return: your identity data is never replicated
                outside the EU; encryption keys for EU clusters are held in the EU;
                we are not certified under the EU-US Data Privacy Framework and do
                not rely on it; and any request from any government is handled under
                our{" "}
                <Link to="/company/government-requests/" className="ilink">
                  government requests policy
                </Link>
                . To date we have received none, and we publish that count every
                year.
              </p>
            </div>
          </div>
        </Section>

        {/* Keys and access */}
        <Section id="keys-and-access" className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)]">
              <h2 className="text-white">Keys and access control</h2>
              <p className="mt-6 text-gray-300">
                Realm signing keys for EU clusters are held in AWS KMS in the
                Frankfurt region and do not leave the EU. To be precise about
                something the industry is often vague about: these are our keys held
                in our key management service, not customer-held keys. We do not
                offer bring-your-own-key on hosted clusters today, and we would
                rather say that than imply otherwise.
              </p>
              <p className="mt-4 text-gray-300">
                Administrative access to clusters is restricted to named operations
                roles and logged internally. Those logs are part of what our SOC 2
                Type II audit examines; they are not currently exposed to customers,
                which is a limitation we would like to remove.
              </p>
            </div>
          </div>
        </Section>

        {/* Regulations */}
        <Section id="regulations" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)]">
              <h2 className="text-white">What we sign, and what we do not hold</h2>
              <p className="mt-6 text-gray-300">
                <strong className="text-white">GDPR Article 28.</strong> A written
                data processing agreement covering processing on documented
                instructions, confidentiality, security, subprocessor authorisation
                and notification, assistance with data subject requests, deletion or
                return at the end of the service, and audit rights. The terms are
                published on the{" "}
                <Link to="/company/data-processing/" className="ilink">
                  data processing page
                </Link>
                .
              </p>
              <p className="mt-4 text-gray-300">
                <strong className="text-white">NIS2 and DORA.</strong> If you are in
                scope for either, you will need contractual terms from your identity
                provider covering incident notification, audit and access rights,
                subcontracting and an exit plan. We sign those. Our contractual
                incident notification window is 48 to 72 hours, which is worth
                knowing precisely: NIS2 gives you 24 hours for an early warning, so
                if your own clock depends on ours, tell us during contracting and we
                will discuss what is achievable for your deployment.
              </p>
              <p className="mt-4 text-gray-300">
                <strong className="text-white">
                  What we do not hold, stated plainly.
                </strong>{" "}
                We are not SecNumCloud qualified and will not be, because that
                qualification requires European ownership that a company with a
                United States parent cannot satisfy. We hold no BSI C5 attestation of
                our own; the AWS regions we run in are C5 attested, which is a
                statement about our infrastructure supplier and not about us. We are
                not certified under the EU-US Data Privacy Framework.
              </p>
              <p className="mt-4 text-gray-300">
                <strong className="text-white">What we do hold.</strong> SOC 2 Type
                II and ISO/IEC 27001, both current, with reports available through
                the{" "}
                <a
                  href="https://trust.phasetwo.io"
                  target="_blank"
                  rel="noreferrer"
                  className="ilink"
                >
                  Trust Center
                </a>
                , along with penetration test summaries.
              </p>
            </div>
          </div>
        </Section>

        {/* Exit */}
        <Section id="leaving" className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)]">
              <h2 className="text-white">Leaving</h2>
              <p className="mt-6 text-gray-300">
                We run upstream Keycloak, not a fork and not a Keycloak-inspired
                product, which is what makes leaving a real option rather than a
                clause. You can export your realm configuration and users, and we
                will provide a database dump on request. Deletion of your data at the
                end of the service is a contractual commitment under Article
                28(3)(g), carried out on request.
              </p>
              <p className="mt-4 text-gray-300">
                We do not yet publish a timed exit runbook or issue a deletion
                certificate. Both are in progress, and if either matters to your risk
                assessment, ask us and we will put the detail in writing for your
                contract.
              </p>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)]">
              <h2 className="text-white">Questions we get asked</h2>
              <dl className="mt-10 space-y-8">
                {FAQS.map((f) => (
                  <div key={f.q}>
                    <dt className="text-[17px] font-semibold text-white">{f.q}</dt>
                    <dd className="mt-2 text-gray-300">{f.a}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-12 text-[14px] text-gray-400">
                Related:{" "}
                <Link to="/hosting/dedicated-clusters/" className="ilink">
                  managed Keycloak
                </Link>{" "}
                on dedicated clusters,{" "}
                <Link to="/docs/self-service/regions/" className="ilink">
                  available regions
                </Link>
                ,{" "}
                <Link to="/company/data-processing/" className="ilink">
                  data processing
                </Link>{" "}
                and{" "}
                <Link to="/company/government-requests/" className="ilink">
                  government requests
                </Link>
                .
              </p>
              <p className="mt-6 text-[13px] text-gray-500">
                Last reviewed: {LAST_REVIEWED}. The legal position described here
                changes; we review this page quarterly and on any material change.
              </p>
            </div>
          </div>
        </Section>

        <Cta
          sectionClassName="subpage-section cta-section-gradient"
          background="primary"
          primaryText="Run Keycloak in Frankfurt"
          secondaryText="Or send this page to your data protection officer first."
          showCta
          ctaLabel="Try for Free"
          ctaHref="https://dash.phasetwo.io/"
        />
      </main>
    </Layout>
  );
}
