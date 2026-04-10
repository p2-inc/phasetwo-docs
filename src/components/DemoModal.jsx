import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

const ZOOM_URLS = {
  us: "https://scheduler.zoom.us/phasetwo/general-meeting--30-mins?embed=true",
  eu: "https://scheduler.zoom.us/phasetwo/eu-30-mins?embed=true",
};

const buildInitialForm = () => ({
  name: "",
  email: "",
  company: "",
  message: "",
});

export default function DemoModal({
  isOpen,
  onClose,
  demoRequestEndpoint,
  turnstileSiteKey,
}) {
  const isLocalDev =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const isTurnstileEnabled = Boolean(turnstileSiteKey) && !isLocalDev;

  const [view, setView] = useState("scheduler"); // 'scheduler' | 'form'
  const [region, setRegion] = useState("us");
  const [form, setForm] = useState(buildInitialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isTurnstileReady, setIsTurnstileReady] = useState(false);
  const [turnstileFailed, setTurnstileFailed] = useState(false);

  const turnstileContainerRef = useRef(null);
  const turnstileWidgetIdRef = useRef(null);
  const autoDismissRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setView("scheduler");
      setRegion("us");
      setForm(buildInitialForm());
      setError("");
      setSuccess("");
      setTurnstileToken("");
      setTurnstileFailed(false);
      clearTimeout(autoDismissRef.current);
    }
  }, [isOpen]);

  // Turnstile lifecycle
  useEffect(() => {
    if (!isTurnstileEnabled) return;
    if (!isOpen || view !== "form") return;
    if (typeof window === "undefined") return;

    let cancelled = false;
    let waitTimer;

    const renderTurnstile = () => {
      if (cancelled) return;
      if (!window.turnstile?.render || !turnstileContainerRef.current) {
        waitTimer = window.setTimeout(renderTurnstile, 100);
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
            setTurnstileFailed(false);
            setError("");
          },
          "error-callback": () => {
            setTurnstileToken("");
            setTurnstileFailed(true);
            setError("Verification failed. Please refresh and try again.");
          },
          "expired-callback": () => {
            setTurnstileToken("");
            setError("Verification expired. Please complete it again.");
          },
        },
      );
    };

    renderTurnstile();

    return () => {
      cancelled = true;
      setTurnstileToken("");
      setIsTurnstileReady(false);
      clearTimeout(waitTimer);
      if (window.turnstile?.remove && turnstileWidgetIdRef.current !== null) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [isTurnstileEnabled, isOpen, view, turnstileSiteKey]);

  const resetTurnstile = () => {
    setTurnstileToken("");
    if (!window.turnstile?.reset || turnstileWidgetIdRef.current === null)
      return;
    window.turnstile.reset(turnstileWidgetIdRef.current);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!demoRequestEndpoint) {
      setError("Demo request endpoint is not configured.");
      return;
    }
    if (isTurnstileEnabled && !turnstileToken) {
      setError("Please complete verification before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(demoRequestEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          firstName: form.name,
          company: form.company,
          ...(form.message.trim() ? { message: form.message.trim() } : {}),
          ...(isTurnstileEnabled ? { turnstileToken } : {}),
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const rawError = data?.error || "Request failed";
        const isTurnstileError = rawError === "turnstile failed";
        if (isTurnstileError) setTurnstileFailed(true);
        throw new Error(
          isTurnstileError
            ? "Verification could not be completed. Please try again."
            : rawError,
        );
      }

      setSuccess("Request received. We will follow up shortly.");
      autoDismissRef.current = setTimeout(() => {
        onClose();
      }, 8000);
    } catch (err) {
      resetTurnstile();
      setError(err?.message || "Unable to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "h-12 rounded-[16px] border border-[var(--form-outline)] bg-white/[0.02] px-4 text-white transition-colors duration-200 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--form-outline-focus)]";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-8 backdrop-blur-[8px]"
      style={{ backgroundColor: "rgba(33, 33, 33, 0.85)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      onClick={onClose}
    >
      <div
        className="relative flex w-full flex-col rounded-[32px] border shadow-2xl"
        style={{
          borderColor: "#383838",
          backgroundColor: "rgba(20, 20, 20, 0.97)",
          maxWidth: view === "scheduler" ? "860px" : "480px",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex flex-shrink-0 items-center justify-between border-b px-8 py-6"
          style={{ borderColor: "#2a2a2a" }}
        >
          <div>
            <p
              className="mb-1 text-xs uppercase tracking-widest text-gray-400"
              style={{ fontWeight: "var(--ifm-font-weight-semibold)" }}
            >
              Phase Two
            </p>
            <h3
              id="demo-modal-title"
              className="mb-0 text-white"
              style={{
                fontWeight: "var(--ifm-font-weight-base)",
                fontSize: "1.5rem",
              }}
            >
              Get a Demo
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1l16 16M17 1L1 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Tab switcher */}
        <div
          className="flex flex-shrink-0 gap-1 border-b px-8 pt-4"
          style={{ borderColor: "#2a2a2a" }}
        >
          <button
            type="button"
            onClick={() => setView("scheduler")}
            className="inline-flex items-center gap-1.5 pb-3 text-sm transition-colors"
            style={{
              color: view === "scheduler" ? "white" : "#9ca3af",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom:
                view === "scheduler"
                  ? "2px solid var(--ifm-color-primary)"
                  : "2px solid transparent",
              fontWeight:
                view === "scheduler"
                  ? "var(--ifm-font-weight-semibold)"
                  : "normal",
              cursor: "pointer",
              paddingBottom: "12px",
              paddingLeft: "4px",
              paddingRight: "4px",
              marginRight: "16px",
            }}
          >
            <Icon icon="lucide:calendar" width="15" height="15" />
            Book a Time
          </button>
          <button
            type="button"
            onClick={() => setView("form")}
            className="inline-flex items-center gap-1.5 pb-3 text-sm transition-colors"
            style={{
              color: view === "form" ? "white" : "#9ca3af",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom:
                view === "form"
                  ? "2px solid var(--ifm-color-primary)"
                  : "2px solid transparent",
              fontWeight:
                view === "form" ? "var(--ifm-font-weight-semibold)" : "normal",
              cursor: "pointer",
              paddingBottom: "12px",
              paddingLeft: "4px",
              paddingRight: "4px",
            }}
          >
            <Icon icon="lucide:mail" width="15" height="15" />
            Request a Callback
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {view === "scheduler" ? (
            <div className="flex flex-col">
              {/* Region toggle */}
              <div className="flex gap-2 px-8 pb-4 pt-6">
                <button
                  type="button"
                  onClick={() => setRegion("us")}
                  className="rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background:
                      region === "us"
                        ? "var(--ifm-color-primary)"
                        : "rgba(255,255,255,0.06)",
                    color: region === "us" ? "white" : "#9ca3af",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  US / Global
                </button>
                <button
                  type="button"
                  onClick={() => setRegion("eu")}
                  className="rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background:
                      region === "eu"
                        ? "var(--ifm-color-primary)"
                        : "rgba(255,255,255,0.06)",
                    color: region === "eu" ? "white" : "#9ca3af",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  EU
                </button>
              </div>

              {/* Zoom iframe */}
              <div className="px-4 pb-6">
                <iframe
                  key={region}
                  src={ZOOM_URLS[region]}
                  title={`Book a demo — ${region === "us" ? "US / Global" : "EU"}`}
                  width="100%"
                  height="580"
                  style={{
                    border: "none",
                    borderRadius: "16px",
                    display: "block",
                    background: "#fff",
                  }}
                  allow="camera *; microphone *; fullscreen *"
                />
              </div>

              <div
                className="flex flex-shrink-0 items-center justify-center border-t px-8 py-4"
                style={{ borderColor: "#2a2a2a" }}
              >
                <p className="mb-0 text-sm text-gray-400">
                  Prefer to be contacted?{" "}
                  <button
                    type="button"
                    onClick={() => setView("form")}
                    className="font-medium text-p2blue-400 underline-offset-2 hover:underline"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Leave your details
                  </button>{" "}
                  and we'll reach out.
                </p>
              </div>
            </div>
          ) : (
            <div className="px-8 py-8">
              <p className="mb-6 text-sm text-gray-300">
                Leave your name and email and our team will reach out.
              </p>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-1 text-sm text-gray-200">
                  Name
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFieldChange}
                    required
                    className={inputClass}
                    placeholder="Grace Hopper"
                    disabled={isSubmitting}
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-200">
                  Work Email
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFieldChange}
                    required
                    className={inputClass}
                    placeholder="grace@yourcompany.com"
                    disabled={isSubmitting}
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-200">
                  Company
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleFieldChange}
                    className={inputClass}
                    placeholder="Acme Security, Inc."
                    disabled={isSubmitting}
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-200">
                  <span>
                    Message <span className="text-gray-500">(optional)</span>
                  </span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleFieldChange}
                    rows={3}
                    className="resize-none rounded-[16px] border border-[var(--form-outline)] bg-white/[0.02] px-4 py-3 text-white transition-colors duration-200 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--form-outline-focus)]"
                    placeholder="Tell us about your use case or any questions you have..."
                    disabled={isSubmitting}
                  />
                </label>

                {isTurnstileEnabled ? (
                  <div>
                    <div ref={turnstileContainerRef} />
                    {!isTurnstileReady ? (
                      <p className="mb-0 mt-2 text-xs text-gray-400">
                        Loading verification...
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {error ? (
                  <div className="flex flex-col gap-1">
                    <p className="mb-0 text-sm text-red-300">{error}</p>
                    {turnstileFailed ? (
                      <p className="mb-0 text-xs text-gray-400">
                        Having trouble?{" "}
                        <a
                          href="mailto:sales@phasetwo.io"
                          className="text-p2blue-400 underline-offset-2 hover:underline"
                        >
                          Email us at sales@phasetwo.io
                        </a>{" "}
                        and we'll get you set up.
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {success ? (
                  <p className="mb-0 text-sm text-emerald-300">{success}</p>
                ) : null}

                <div className="flex justify-between gap-3 pt-2">
                  <button
                    type="button"
                    className="text-sm text-gray-400 underline-offset-2 hover:text-white hover:underline"
                    onClick={() => setView("scheduler")}
                    disabled={isSubmitting}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ← Book a time instead
                  </button>
                  <button
                    type="submit"
                    className="btnPrimary disabled:opacity-60"
                    disabled={
                      isSubmitting || (isTurnstileEnabled && !turnstileToken)
                    }
                  >
                    {isSubmitting ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
