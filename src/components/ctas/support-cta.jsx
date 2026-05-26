import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useState } from "react";
import DemoModal from "../DemoModal";
import Cta from "./homepage-dual-line-cta";

export default function SupportCta({
  primaryText,
  secondaryText,
  ctaLabel = "Get in Touch",
  sectionClassName,
  background = "secondary",
}) {
  const { siteConfig: { customFields = {} } = {} } = useDocusaurusContext();
  const demoRequestEndpoint =
    typeof customFields.demoRequestEndpoint === "string"
      ? customFields.demoRequestEndpoint
      : undefined;
  const turnstileSiteKey =
    typeof customFields.turnstileSiteKey === "string"
      ? customFields.turnstileSiteKey
      : undefined;

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Cta
        sectionClassName={sectionClassName}
        background={background}
        primaryText={primaryText}
        secondaryText={secondaryText}
        showCta
        ctaLabel={ctaLabel}
        onCtaClick={() => setModalOpen(true)}
      />
      <DemoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        demoRequestEndpoint={demoRequestEndpoint}
        turnstileSiteKey={turnstileSiteKey}
      />
    </>
  );
}
