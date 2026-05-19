import React from "react";
import ExtensionPageLayout from "../../components/ExtensionPageLayout";

const meta = {
  title: "Phase Two Keycloak Container Images — Production-Ready Keycloak with Extensions",
  description:
    "Open source Keycloak container images bundled with the Phase Two extensions, opinionated defaults, and production-ready build wiring. The fastest way to run Keycloak with batteries included.",
};

const hero = {
  title: "Containers for Keycloak",
  description:
    "Production-ready Keycloak container images, bundled with the full Phase Two extension suite and opinionated defaults. The fastest way to a Keycloak deployment that does what your team actually expects.",
  imageSrc: "/img/extension-authors.svg",
  primaryCtaLabel: "View on GitHub",
  primaryCtaHref: "https://github.com/p2-inc/phasetwo-containers",
  secondaryCtaLabel: "Pull from Quay",
  secondaryCtaHref: "https://quay.io/repository/phasetwo/phasetwo-keycloak",
};

const problem = {
  title: "The upstream Keycloak image is a starting point, not a finish line",
  intro:
    "The official image is intentionally minimal — no extensions, no opinions, build-time configuration required to do anything non-default.",
  points: [
    {
      title: "No extensions included",
      description:
        "Want Organizations, webhooks, magic links, or themes? You have to assemble them yourself and rebuild the image.",
    },
    {
      title: "Build wiring is fiddly",
      description:
        "Getting `kc.sh build` to run at image build time — not container start time — takes care most teams skip, costing startup performance and reliability.",
    },
    {
      title: "Everyone redoes the same work",
      description:
        "Every team running Keycloak in production rebuilds this layer. Most do it slightly differently and slightly wrong.",
    },
  ],
};

const whyBuilt = {
  title: "An image we could ship to production on day one",
  intro:
    "We maintain the Phase Two containers because we needed Keycloak that does what we expect out of the box — and so do our self-hosted users.",
  points: [
    {
      title: "All extensions bundled",
      description:
        "Organizations, Admin Portal, IdP Wizard, Magic Link, Events, Themes, and User Migration — version-aligned and tested together.",
    },
    {
      title: "Production defaults",
      description:
        "Sane defaults for caching, HTTP, and providers. The build optimizations Keycloak's own docs recommend, applied for you.",
    },
    {
      title: "Fast, identical startup",
      description:
        "`kc.sh build` runs at image build time. Containers start fast and start the same way every time.",
    },
    {
      title: "Tracks upstream releases",
      description:
        "New images cut for every Keycloak release we support, with the extension suite re-pinned to compatible versions.",
    },
  ],
};

const useCases = {
  title: "What teams use them for",
  cards: [
    {
      heading: "Drop-in upstream replacement",
      description:
        "Swap the official Keycloak image for the Phase Two image and immediately have Organizations, Admin Portal, webhooks, magic links, and themes — without assembling a custom build.",
    },
    {
      heading: "Self-hosting at production scale",
      description:
        "Sane defaults for caching, HTTP, and provider configuration so you can focus on running Keycloak instead of compiling it.",
    },
    {
      heading: "Local dev that matches production",
      description:
        "Use the same image in development that runs in production. Catch extension and config issues before they ship.",
    },
    {
      heading: "Base for further customization",
      description:
        "Use as a base image and layer your own extensions or themes on top. Inherit the Phase Two build wiring, override only what you need.",
    },
  ],
};

const capabilities = {
  cards: [
    {
      title: "All extensions, one image",
      description:
        "Organizations, Admin Portal, IdP Wizard, Magic Link, Events, Themes, and User Migration — bundled, version-aligned, and tested against the included Keycloak version.",
    },
    {
      title: "Optimized build phase",
      description:
        "The `kc.sh build` step runs at image build time, not container start time. Containers start fast and start the same way every time.",
    },
    {
      title: "Tracks upstream Keycloak releases",
      description:
        "New images cut for every Keycloak release we support, with the extension suite re-pinned to compatible versions.",
    },
  ],
};

const getStarted = {
  cards: [
    {
      heading: "Pull from Quay",
      description:
        "Images published to Quay.io. Use a release tag matching your target Keycloak version.",
      linkLabel: "quay.io/phasetwo/phasetwo-keycloak",
      linkUrl: "https://quay.io/repository/phasetwo/phasetwo-keycloak",
    },
    {
      heading: "Read the Dockerfile",
      description:
        "Source Dockerfiles, build scripts, and version matrix on GitHub.",
      linkLabel: "p2-inc/phasetwo-containers",
      linkUrl: "https://github.com/p2-inc/phasetwo-containers",
    },
    {
      heading: "Skip the install",
      description:
        "Phase Two managed Keycloak runs on these same images, configured and operated for you.",
      linkLabel: "Try the hosted version",
      linkUrl: "https://dash.phasetwo.io/",
    },
  ],
};

export default function ContainersExtension() {
  return (
    <ExtensionPageLayout
      meta={meta}
      hero={hero}
      problem={problem}
      whyBuilt={whyBuilt}
      useCases={useCases}
      capabilities={capabilities}
      getStarted={getStarted}
    />
  );
}
