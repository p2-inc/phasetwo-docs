import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import ComposeGenerator from "../../components/tools/compose/ComposeGenerator";
import { KEYCLOAK_MAJOR } from "../../components/tools/compose/generate";

const PAGE_META = {
  title: "Keycloak Docker Compose Generator — docker-compose.yml for Keycloak",
  description:
    "Free Keycloak Docker Compose generator. Build a docker-compose.yml and .env for Keycloak or the Phase Two image with PostgreSQL, MySQL, MariaDB, or CockroachDB, a Caddy, Traefik, or nginx TLS proxy, health checks, realm import, and Mailpit. Runs in your browser.",
  // Targets: keycloak docker compose, keycloak docker-compose.yml, keycloak postgres docker compose.
  keywords:
    "keycloak docker compose, keycloak docker-compose, keycloak docker-compose.yml, keycloak docker compose postgres, keycloak docker compose mysql, keycloak docker compose production, keycloak reverse proxy docker, keycloak caddy, keycloak traefik, keycloak nginx docker, keycloak start-dev docker, keycloak import realm docker compose, keycloak healthcheck docker compose",
  url: "https://phasetwo.io/tools/keycloak-docker-compose-generator",
};

const FAQS = [
  {
    q: "Are the generated passwords safe to use?",
    a: "Yes. The admin and database passwords are created in your browser with the Web Crypto API and are never sent to Phase Two or anywhere else. They go into the .env file, which Docker Compose reads automatically, so the docker-compose.yml itself contains no secrets and is safe to commit.",
  },
  {
    q: "What is the difference between start-dev and start?",
    a: "start-dev runs Keycloak in development mode: HTTP is allowed, the hostname is not enforced, and themes are not cached. start runs production mode, which requires a hostname, expects TLS (directly or at a proxy), and turns on caching. Use start-dev on your laptop and start for anything other people will use.",
  },
  {
    q: "Which database should I use with Keycloak in Docker?",
    a: "PostgreSQL is the most common choice and the one we recommend for self-hosting. MySQL and MariaDB are fully supported. The Phase Two image also supports CockroachDB, which is what Phase Two's managed clusters run on. The embedded H2 database is only for development and loses data when the container is removed.",
  },
  {
    q: "How do I run Keycloak behind a reverse proxy in Docker Compose?",
    a: "Choose Reverse proxy + TLS. The generator adds a Caddy, Traefik, or nginx service that terminates TLS and forwards to Keycloak over the internal Docker network, enables HTTP on Keycloak only inside that network, sets KC_PROXY_HEADERS=xforwarded so Keycloak builds correct https URLs, and sets KC_HOSTNAME to your public hostname. Keycloak itself is not published on the host.",
  },
  {
    q: "Why does the Keycloak healthcheck use bash instead of curl?",
    a: "Neither the official Keycloak image nor the Phase Two image ships curl. The healthcheck opens a TCP connection to the management port (9000) with bash's /dev/tcp and checks that /health/ready returns HTTP 200. That lets other services wait for Keycloak with depends_on: condition: service_healthy.",
  },
  {
    q: "How do I import a realm on startup?",
    a: "Turn on realm import, put one or more realm export JSON files in a ./realms directory next to docker-compose.yml, and start the stack. Keycloak runs with --import-realm and imports each file. Realms that already exist are skipped, so the import is safe to leave on.",
  },
  {
    q: "What is the Phase Two Keycloak image?",
    a: "quay.io/phasetwo/phasetwo-keycloak is a drop-in replacement for the official image: the same kc.sh entrypoint and KC_* options, plus the Phase Two extensions for organizations, webhooks, magic links, themes, SCIM, and more, on a hardened non-root runtime. It is the same image that runs Phase Two's managed clusters.",
  },
  {
    q: "Why does the first production start take longer?",
    a: "The images are not pre-built for a specific database, so the first start in production mode runs Keycloak's build step for the database you chose before starting. To skip it, build your own image from a pinned tag with kc.sh build and run start --optimized.",
  },
];

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2.5 mt-10 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

function HostedCta() {
  return (
    <section className="mx-auto mt-16 max-w-3xl rounded-2xl border border-p2blue-500/30 bg-p2blue-500/[0.06] p-6 text-center">
      <h2 className="mb-2 text-xl font-semibold text-white">
        Prefer not to run it yourself?
      </h2>
      <p className="mb-5 text-[0.95rem] text-gray-300">
        Phase Two runs this same Keycloak image for you, with the database,
        backups, upgrades, TLS, and monitoring handled. Start a cluster in
        minutes.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <a
          href="https://dash.phasetwo.io/"
          target="_blank"
          rel="noreferrer"
          className="btnPrimary"
        >
          Try for Free
        </a>
        <Link to="/pricing" className="font-semibold text-p2blue-400">
          See pricing <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export default function ComposeGeneratorPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Keycloak Docker Compose Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: PAGE_META.url,
    description: PAGE_META.description,
    featureList: [
      "Generate docker-compose.yml and .env for Keycloak",
      "Phase Two or upstream Keycloak image",
      "PostgreSQL, MySQL, MariaDB, CockroachDB, or H2",
      "Caddy, Traefik, or nginx reverse proxy with Let's Encrypt or self-signed TLS",
      "Health checks, metrics, realm import, custom themes, and Mailpit",
      "Passwords generated in the browser",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <Head>
        <meta name="keywords" content={PAGE_META.keywords} />
        <link rel="canonical" href={PAGE_META.url} />
        <script type="application/ld+json">{JSON.stringify(appJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Head>

      <main className="margin-vert--lg container">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="mb-3 text-4xl font-semibold text-white">
            Keycloak Docker Compose Generator
          </h1>
          <p className="text-lg text-gray-400">
            Pick a database, a mode, and how users reach the server, and get a
            working <code>docker-compose.yml</code> and <code>.env</code> for
            Keycloak or the Phase Two image — with healthchecks, a TLS reverse
            proxy, and generated passwords. Everything runs in your browser.
          </p>
        </header>

        <ComposeGenerator />

        <section className="mx-auto mt-16 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300">
          <H2>Running Keycloak with Docker Compose</H2>
          <p className="mb-4">
            Keycloak needs a database and, in production, a hostname and TLS. A
            single <code>docker run</code> gets you a throwaway server; Docker
            Compose lets you describe the whole stack — Keycloak, its database,
            a reverse proxy, and helpers like a mail catcher — in one file and
            bring it up with one command. This generator writes that file for
            the current Keycloak {KEYCLOAK_MAJOR} configuration options (
            <code>KC_DB</code>, <code>KC_HOSTNAME</code>,{" "}
            <code>KC_PROXY_HEADERS</code>, <code>KC_HTTP_ENABLED</code>,{" "}
            <code>KC_BOOTSTRAP_ADMIN_USERNAME</code>, and friends), so you do
            not have to piece it together from old blog posts that still use{" "}
            <code>KEYCLOAK_ADMIN</code> and{" "}
            <code>PROXY_ADDRESS_FORWARDING</code>.
          </p>

          <H2>Development vs. production</H2>
          <p className="mb-4">
            In <strong className="text-white">development mode</strong> (
            <code>start-dev</code>) Keycloak serves plain HTTP on{" "}
            <code>localhost</code>, relaxes hostname checks, and reloads theme
            changes immediately. It is the fastest way to try a realm or build a
            login theme. In{" "}
            <strong className="text-white">production mode</strong> (
            <code>start</code>) Keycloak requires <code>KC_HOSTNAME</code>,
            expects HTTPS — terminated either by Keycloak or by a proxy in front
            of it — and enables caching. The generator warns you when a
            combination is unsafe, such as production over plain HTTP or with
            the <code>admin</code>/<code>admin</code> bootstrap password.
          </p>
          <p className="mb-4">
            Before going live, work through the{" "}
            <Link to="/blog/keycloak-production-checklist">
              Keycloak production readiness checklist
            </Link>
            .
          </p>

          <H2>Keycloak behind a reverse proxy</H2>
          <p className="mb-4">
            The most common production layout puts a proxy in front of Keycloak
            to terminate TLS. With <strong className="text-white">Caddy</strong>{" "}
            or <strong className="text-white">Traefik</strong>, the generated
            stack gets and renews a Let's Encrypt certificate on its own, or
            uses a self-signed certificate for local testing. Traefik reads its
            routes from an inline file, so the Docker socket is never mounted.
            With <strong className="text-white">nginx</strong>, you mount your
            own certificate. In every case Keycloak listens on HTTP only on the
            internal Docker network, trusts the proxy's{" "}
            <code>X-Forwarded-*</code> headers (
            <code>KC_PROXY_HEADERS=xforwarded</code>), and is not published on
            the host, so the proxy is the only way in. If you would rather
            terminate TLS in Keycloak itself, choose{" "}
            <em className="text-white">Direct TLS</em> and mount a certificate
            and key.
          </p>

          <H2>The Phase Two Keycloak image</H2>
          <p className="mb-4">
            The default image is{" "}
            <Link to="/docs/hosting/docker">
              <code>quay.io/phasetwo/phasetwo-keycloak</code>
            </Link>
            , the same image that runs Phase Two's managed clusters. It is a
            drop-in replacement for the official image with the{" "}
            <Link to="/extensions/organizations">Organizations</Link>,{" "}
            <Link to="/extensions/events">Events</Link>,{" "}
            <Link to="/extensions/magic-link">Magic Link</Link>,{" "}
            <Link to="/extensions/themes">Themes</Link>,{" "}
            <Link to="/extensions/admin-portal">Admin Portal</Link>, and{" "}
            <Link to="/extensions/idp-wizard">IdP Wizard</Link> extensions built
            in, plus CockroachDB support. Phase Two serves Keycloak under{" "}
            <code>/auth</code>, so the generator does too when you pick this
            image. Tags follow{" "}
            <code>&lt;keycloak-version&gt;.&lt;build-timestamp&gt;</code>; pin
            the full tag in production. See{" "}
            <Link to="/docs/hosting/database">Database</Link> for PostgreSQL and
            CockroachDB settings, and{" "}
            <Link to="/docs/hosting/kubernetes">Kubernetes</Link> when you
            outgrow a single host.
          </p>

          <H2>Frequently asked questions</H2>
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {FAQS.map((f) => (
              <div key={f.q} className="mb-5">
                <h3 className="mb-1 text-base font-semibold text-white">
                  {f.q}
                </h3>
                <p className="mb-0 text-sm text-gray-400">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <HostedCta />
      </main>
    </Layout>
  );
}
