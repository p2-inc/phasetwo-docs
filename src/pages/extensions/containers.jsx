import React from "react";
import ExtensionSubpage from "../../components/extensions/ExtensionSubpage";

const CONTENT = {
  slug: "containers",
  name: "Containers",
  category: "Operations",
  iconKey: "containers",
  diagramKey: "containers",
  repo: "p2-inc/keycloak-containers",
  meta: {
    title: "Phase Two Keycloak Containers — Production-ready Images",
    description:
      "Pre-built Keycloak container images with the Phase Two extension suite, opinionated production defaults, Helm chart, and run-anywhere deployment.",
  },
  hero: {
    h1: "Production-ready Keycloak images, with our extensions baked in.",
    lead: "Pre-built container images for Kubernetes, Helm, Docker Compose, ECS, and more — Keycloak plus the Phase Two extension suite plus the operational defaults you'd otherwise wire up yourself.",
    badges: ["GHCR", "Helm Chart", "K8s · ECS · Compose", "Pinned Upstream Keycloak", "Health + Metrics"],
  },
  problem: {
    heading: "Running Keycloak in production is a lot more than 'docker run keycloak'.",
    cards: [
      { title: "Defaults are dev-mode", body: "Stock Keycloak's defaults assume dev. Production needs JVM tuning, health checks, metrics, TLS, and clustering — none of it on by default." },
      { title: "Extensions live in your build", body: "Want orgs + webhooks + magic link? You build them into a custom image. We've already done that build." },
      { title: "Helm charts are bring-your-own", body: "There's no single official Helm chart that bundles Keycloak with the extensions teams actually want." },
    ],
  },
  approach: {
    heading: "An image that's ready for prod the moment you pull it",
    cards: [
      { title: "Phase Two extensions baked in", body: "Orgs, webhooks, magic link, IdP wizard, admin portal, themes — all installed and configured." },
      { title: "Opinionated production defaults", body: "JVM flags, health endpoints, metrics scrape, TLS-ready, clustering hints." },
      { title: "Pinned upstream Keycloak", body: "Locked to a known-good Keycloak version. You can override." },
      { title: "Helm + K8s + Compose + ECS", body: "Same image, runs anywhere. Helm chart covers the common K8s setup." },
    ],
  },
  useCases: {
    heading: "Where the images fit",
    intro: "Anywhere you'd otherwise be assembling your own Keycloak Dockerfile.",
    items: [
      { title: "Kubernetes via Helm", sub: "Drop-in Helm chart with sensible defaults." },
      { title: "ECS / Fargate", sub: "Production image, no DIY build pipeline." },
      { title: "Docker Compose dev", sub: "Local dev that matches prod." },
      { title: "Bare-metal / VM", sub: "Same image, run it however you run things." },
    ],
  },
  capabilities: {
    heading: "What you get when you pull the image",
    items: [
      { title: "Extensions installed", body: "Orgs · IdP Wizard · Magic Link · Webhooks · Themes · Admin Portal." },
      { title: "Health + metrics", body: "/health/live, /health/ready, /metrics for Prometheus scraping." },
      { title: "JVM tuned for containers", body: "GC, memory, file descriptors — sized for the container, not the host." },
      { title: "Pinned Keycloak", body: "Locked to a tested upstream version. Override with a build arg." },
      { title: "Helm chart", body: "K8s with sane defaults — replicas, PDBs, ingress, secrets." },
      { title: "TLS-ready", body: "Mount certs, terminate at the pod. Or terminate upstream." },
    ],
  },
};

export default function ContainersExtension() {
  return <ExtensionSubpage content={CONTENT} />;
}
