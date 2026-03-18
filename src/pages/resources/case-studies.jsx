import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import React from "react";

import CardDocument from "../../components/CardDocument";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const PAGE_META = {
  title: "Case Studies",
  description:
    "Discover how leading organizations leverage Phase Two's Keycloak expertise for secure, scalable, and cost-effective identity management. Explore our case studies to see real-world results and learn how we can help you achieve your IAM goals.",
};

const CASE_STUDIES = [
  {
    assetId: "dexcom",
    company: "Dexcom",
    pictogram: "/customer-logos/dexcom.svg",
    title: "Modernizing Keycloak for Global Healthcare Scale",
    description:
      "See how Dexcom upgraded from Keycloak 22 to 26 with zero customer impact, lower infrastructure cost, and a clear path to multi-region HA.",
  },
  {
    assetId: "benifex",
    company: "Benifex",
    pictogram: "/customer-logos/benefex.svg",
    title: "Consolidating 1M MAU Identity in 60 Days",
    description:
      "Learn how Benifex replaced fragmented identity systems, completed an Okta migration in 60 days, and scaled multi-tenant SSO with Keycloak.",
  },
  {
    assetId: "gusto",
    company: "Gusto",
    pictogram: "/customer-logos/gusto.svg",
    title: "Scaling a Deeply Customized Keycloak Deployment",
    description:
      "Read how Gusto modernized a complex Keycloak stack, reduced upgrade risk, and enabled CI/CD-friendly identity changes at high velocity.",
  },
  {
    assetId: "plotly",
    company: "Plotly",
    pictogram: "/customer-logos/plotly.svg",
    title: "Secure On-Prem Identity for Dash Enterprise",
    description:
      "Explore how Plotly delivered self-service enterprise SSO, audit-ready identity events, and upgradeable Keycloak in customer-managed environments.",
  },
];

const HERO = {
  title: "Case Studies",
  description:
    "Learn from real-world Keycloak implementations—how complex authentication problems were solved, security was hardened, and scalable identity architectures were delivered.",
};

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 30%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const PAGE_CTA = {
  primaryText: "Ready to Try Keycloak?",
  secondaryText: "Create Your Free Deployment Today.",
  ctaLabel: "Try for Free",
  ctaHref: "https://dash.phasetwo.io/",
};

const buildInitialRequestForm = () => ({
  name: "",
  email: "",
  company: "",
});

export default function CaseStudies() {
  const { siteConfig } = useDocusaurusContext();
  const customFields = siteConfig?.customFields || {};
  const caseStudyRequestEndpoint =
    typeof customFields.caseStudyRequestEndpoint === "string"
      ? customFields.caseStudyRequestEndpoint
      : "";
  const turnstileSiteKey =
    typeof customFields.turnstileSiteKey === "string"
      ? customFields.turnstileSiteKey
      : "";
  const isLocalDevelopment =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const isTurnstileEnabled = Boolean(turnstileSiteKey) && !isLocalDevelopment;

  const [selectedCaseStudy, setSelectedCaseStudy] = React.useState(null);
  const [requestForm, setRequestForm] = React.useState(buildInitialRequestForm);
  const [isSubmittingRequest, setIsSubmittingRequest] = React.useState(false);
  const [requestError, setRequestError] = React.useState("");
  const [requestSuccess, setRequestSuccess] = React.useState("");
  const [turnstileToken, setTurnstileToken] = React.useState("");
  const [isTurnstileReady, setIsTurnstileReady] = React.useState(false);
  const autoDismissTimerRef = React.useRef(null);
  const turnstileContainerRef = React.useRef(null);
  const turnstileWidgetIdRef = React.useRef(null);

  const clearAutoDismissTimer = () => {
    if (!autoDismissTimerRef.current) return;
    clearTimeout(autoDismissTimerRef.current);
    autoDismissTimerRef.current = null;
  };

  React.useEffect(() => {
    return () => {
      if (!autoDismissTimerRef.current) return;
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!isTurnstileEnabled) return;
    if (!selectedCaseStudy) return;
    if (typeof window === "undefined") return;

    let isCancelled = false;
    let waitForTurnstileTimer;

    const renderTurnstile = () => {
      if (isCancelled) return;

      if (!window.turnstile?.render || !turnstileContainerRef.current) {
        waitForTurnstileTimer = window.setTimeout(renderTurnstile, 100);
        return;
      }

      setIsTurnstileReady(true);
      turnstileWidgetIdRef.current = window.turnstile.render(
        turnstileContainerRef.current,
        {
          sitekey: turnstileSiteKey,
          appearance: "interaction-only",
          theme: "auto",
          size: "flexible",
          callback: (token) => {
            setTurnstileToken(token);
            setRequestError("");
          },
          "error-callback": () => {
            setTurnstileToken("");
            setRequestError("Verification failed. Please try again.");
          },
          "expired-callback": () => {
            setTurnstileToken("");
            setRequestError(
              "Verification expired. Please complete Turnstile again.",
            );
          },
        },
      );
    };

    renderTurnstile();

    return () => {
      isCancelled = true;
      setTurnstileToken("");
      setIsTurnstileReady(false);

      if (waitForTurnstileTimer) {
        window.clearTimeout(waitForTurnstileTimer);
      }

      if (window.turnstile?.remove && turnstileWidgetIdRef.current !== null) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [isTurnstileEnabled, selectedCaseStudy, turnstileSiteKey]);

  const resetTurnstile = () => {
    setTurnstileToken("");
    if (typeof window === "undefined") return;
    if (!window.turnstile?.reset || turnstileWidgetIdRef.current === null)
      return;
    window.turnstile.reset(turnstileWidgetIdRef.current);
  };

  const openRequestModal = (study) => {
    clearAutoDismissTimer();
    setSelectedCaseStudy(study);
    setRequestForm(buildInitialRequestForm());
    setRequestError("");
    setRequestSuccess("");
    setTurnstileToken("");
  };

  const closeRequestModal = () => {
    if (isSubmittingRequest) return;
    clearAutoDismissTimer();
    setSelectedCaseStudy(null);
    setRequestError("");
    setRequestSuccess("");
    setTurnstileToken("");
  };

  const handleRequestFieldChange = (event) => {
    const { name, value } = event.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaseStudyRequestSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCaseStudy?.assetId) {
      setRequestError("Missing case study asset id.");
      return;
    }
    if (!caseStudyRequestEndpoint) {
      setRequestError("Case study request endpoint is not configured.");
      return;
    }
    if (isTurnstileEnabled && !turnstileToken) {
      setRequestError("Please complete verification before submitting.");
      return;
    }

    setIsSubmittingRequest(true);
    clearAutoDismissTimer();
    setRequestError("");
    setRequestSuccess("");

    try {
      const response = await fetch(caseStudyRequestEndpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          assetId: selectedCaseStudy.assetId,
          email: requestForm.email,
          firstName: requestForm.name,
          company: requestForm.company,
          ...(isTurnstileEnabled ? { turnstileToken } : {}),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setRequestSuccess(
        "Request submitted. Check your email for the case study link.",
      );
      autoDismissTimerRef.current = setTimeout(() => {
        autoDismissTimerRef.current = null;
        setSelectedCaseStudy(null);
        setRequestForm(buildInitialRequestForm());
        setRequestError("");
        setRequestSuccess("");
        setTurnstileToken("");
      }, 10000);
    } catch (error) {
      resetTurnstile();
      setRequestError(error?.message || "Unable to submit request.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <main className="case-studies-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div
            className="relative isolate overflow-hidden"
            style={HERO_BG_STYLE}
          >
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-balance text-white">{HERO.title}</h1>
                <p className="text--body-large mb-0 mt-6 whitespace-pre-line text-gray-300">
                  {HERO.description}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="texture-plus subpage-section py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-[var(--content-width-narrow)] grid-cols-1 gap-5 sm:grid-cols-2">
              {CASE_STUDIES.map((study) => (
                <CardDocument
                  key={study.assetId}
                  pictogram={study.pictogram}
                  eyebrow={`${study.company} + Phase Two`}
                  title={study.title}
                  description={study.description}
                  showButton
                  buttonLabel="Get Case Study"
                  onAction={() => openRequestModal(study)}
                />
              ))}
            </div>
          </div>
        </section>
        {selectedCaseStudy ? (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-8 backdrop-blur-[8px]"
            style={{ backgroundColor: "rgba(33, 33, 33, 0.85)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-request-modal-title"
            onClick={closeRequestModal}
          >
            <div
              className="w-full max-w-lg rounded-[32px] border p-8 shadow-2xl"
              style={{
                borderColor: "#383838",
                backgroundColor: "rgba(20, 20, 20, 0.85)",
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex flex-col">
                <p
                  className="mb-5 text-base uppercase tracking-wider text-gray-400"
                  style={{ fontWeight: "var(--ifm-font-weight-semibold)" }}
                >
                  {selectedCaseStudy.company} + Phase Two
                </p>
                <h3
                  id="case-study-request-modal-title"
                  className="mb-0 text-white"
                  style={{
                    fontWeight: "var(--ifm-font-weight-base)",
                    fontSize: "1.8rem",
                  }}
                >
                  {selectedCaseStudy.title} Case Study
                </h3>
              </div>
              <p className="mb-8 text-sm text-gray-300">
                Enter your details to receive an email with a download link.
              </p>

              <form
                className="flex flex-col gap-4"
                onSubmit={handleCaseStudyRequestSubmit}
              >
                <label className="flex flex-col gap-1 text-sm text-gray-200">
                  Name
                  <input
                    type="text"
                    name="name"
                    value={requestForm.name}
                    onChange={handleRequestFieldChange}
                    required
                    className="h-12 rounded-[16px] border border-[var(--form-outline)] bg-white/[0.02] px-4 text-white transition-colors duration-200 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--form-outline-focus)]"
                    placeholder="Jane Doe"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-200">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={requestForm.email}
                    onChange={handleRequestFieldChange}
                    required
                    className="h-12 rounded-[16px] border border-[var(--form-outline)] bg-white/[0.02] px-4 text-white transition-colors duration-200 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--form-outline-focus)]"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-200">
                  Company
                  <input
                    type="text"
                    name="company"
                    value={requestForm.company}
                    onChange={handleRequestFieldChange}
                    required
                    className="h-12 rounded-[16px] border border-[var(--form-outline)] bg-white/[0.02] px-4 text-white transition-colors duration-200 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--form-outline-focus)]"
                    placeholder="Phase Two"
                  />
                </label>

                {isTurnstileEnabled ? (
                  <div className="">
                    <div ref={turnstileContainerRef} />
                    {!isTurnstileReady ? (
                      <p className="mb-0 mt-2 text-xs text-gray-400">
                        Loading verification...
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {requestError ? (
                  <p className="mb-0 text-sm text-red-300">{requestError}</p>
                ) : null}
                {requestSuccess ? (
                  <p className="mb-0 text-sm text-emerald-300">
                    {requestSuccess}
                  </p>
                ) : null}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="btnSecondary"
                    onClick={closeRequestModal}
                    disabled={isSubmittingRequest}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btnPrimary disabled:opacity-60"
                    disabled={
                      isSubmittingRequest ||
                      (isTurnstileEnabled && !turnstileToken)
                    }
                  >
                    {isSubmittingRequest ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
        {/* CTA */}
        <Cta
          sectionClassName="subpage-section cta-section-gradient"
          background="primary"
          primaryText={PAGE_CTA.primaryText}
          secondaryText={PAGE_CTA.secondaryText}
          showCta
          ctaLabel={PAGE_CTA.ctaLabel}
          ctaHref={PAGE_CTA.ctaHref}
        />
      </main>
    </Layout>
  );
}
