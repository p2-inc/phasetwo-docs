import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import React from "react";

import Cta from "../../components/ctas/homepage-dual-line-cta";

const PAGE_META = {
  title: "Phase Two Case Studies",
  description:
    "Discover how leading organizations leverage Phase Two's Keycloak expertise for secure, scalable, and cost-effective identity management. Explore our case studies to see real-world results and learn how we can help you achieve your IAM goals.",
};

const CASE_STUDIES = [
  {
    assetId: "dexcom",
    title: "Dexcom + Phase Two: Securing Large Systems with Keycloak",
    description:
      "Phase Two helped Dexcom implement Keycloak to secure their growing ecosystem of diabetes management applications, enabling seamless SSO and robust access control across their platform.",
    shortBlurb:
      "Phase Two helped Dexcom implement Keycloak to secure their growing ecosystem of diabetes management applications.",
  },
  {
    assetId: "benifex",
    title: "Benifex + Phase Two: Securing Large Systems with Keycloak",
    description:
      "Phase Two helped Benifex implement Keycloak to secure their growing ecosystem of diabetes management applications, enabling seamless SSO and robust access control across their platform.",
    shortBlurb:
      "Phase Two helped Benifex implement Keycloak to secure their growing ecosystem of diabetes management applications.",
  },
];

const HERO = {
  title: "Enterprise Identity Management Without the Enterprise Price Tag",
  description:
    "Explore real-world case studies showing how organizations use Phase Two and Keycloak to deliver secure, scalable identity experiences.",
  imageSrc: "/img/hero-keycloak-and-phasetwo.svg",
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

const EMPTY_CASE_STUDY_REQUEST_FORM = {
  name: "jeff",
  email: "jpatzer+testlocal1@phasetwo.io",
  company: "phase two",
};

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
  const [requestForm, setRequestForm] = React.useState(
    EMPTY_CASE_STUDY_REQUEST_FORM,
  );
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
    setRequestForm(EMPTY_CASE_STUDY_REQUEST_FORM);
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
        setRequestForm(EMPTY_CASE_STUDY_REQUEST_FORM);
        setRequestError("");
        setRequestSuccess("");
        setTurnstileToken("");
      }, 5000);
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
                <div className="hero-box-image mb-6">
                  <img
                    src={HERO.imageSrc}
                    alt=""
                    className="hero-box-image-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h1 className="text-balance text-white">{HERO.title}</h1>
                <p className="text--body-large mb-0 mt-6 whitespace-pre-line text-gray-300">
                  {HERO.description}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="flex flex-wrap gap-4">
            {CASE_STUDIES.map((study) => (
              <div
                key={study.title}
                className="case-study-card min-w-[300px] flex-1 rounded-lg border border-white/10 p-6"
              >
                <h3>{study.title}</h3>
                <p>{study.description}</p>
                <p>{study.shortBlurb}</p>
                <button
                  type="button"
                  onClick={() => openRequestModal(study)}
                  className="mt-3 inline-flex items-center rounded-md bg-[var(--ifm-color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--ifm-color-primary)] focus:ring-offset-2 focus:ring-offset-black"
                >
                  Get case study
                </button>
              </div>
            ))}
          </div>
        </section>
        {selectedCaseStudy ? (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-request-modal-title"
            onClick={closeRequestModal}
          >
            <div
              className="w-full max-w-lg rounded-xl border border-white/10 bg-slate-950 p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3
                    id="case-study-request-modal-title"
                    className="mb-1 text-white"
                  >
                    {selectedCaseStudy.title} Case Study
                  </h3>
                  <p className="mb-0 text-sm text-gray-300">
                    Enter your details to receive an email with a download link.
                  </p>
                </div>
              </div>

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
                    className="rounded border border-white/20 bg-black/30 px-3 py-2 text-white"
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
                    className="rounded border border-white/20 bg-black/30 px-3 py-2 text-white"
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
                    className="rounded border border-white/20 bg-black/30 px-3 py-2 text-white"
                    placeholder="Phase Two"
                  />
                </label>

                {isTurnstileEnabled ? (
                  <div className="rounded border border-white/10 bg-black/20 p-3">
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
                    className="rounded border border-white/20 px-4 py-2 text-white"
                    onClick={closeRequestModal}
                    disabled={isSubmittingRequest}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-[var(--ifm-color-primary)] px-4 py-2 text-white disabled:opacity-60"
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
