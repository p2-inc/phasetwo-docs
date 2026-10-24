/**
 * The site's analytics surface.
 *
 * Everything goes through the dataLayer that the Google Tag Manager container in
 * docusaurus.config.js reads. Nothing here calls Google directly, every function
 * is a no-op during server rendering, and when the container is absent (local
 * builds without GTM_CONTAINER_ID) the pushes simply accumulate in an array.
 *
 * Consent: the container starts with every storage type denied, set inline in
 * the <head> before it loads. TermsFeed's banner is the source of truth. Its
 * "tracking" level maps to analytics storage and "targeting" to the three ad
 * types, so until a visitor accepts, GA4 and Google Ads receive cookieless
 * pings only and no cookie is written.
 */

const CONSENT_COOKIE = "cookie_consent_level";

export function push(payload) {
  if (typeof window === "undefined") return;
  (window.dataLayer = window.dataLayer || []).push(payload);
}

/** Send a named event with parameters; GTM forwards it to GA4 or Ads. */
export function track(event, params = {}) {
  push({ event, ...params });
}

// Consent commands have to reach the dataLayer as an `arguments` object, which
// is how gtag.js and GTM recognise them; a plain object is ignored.
function gtag() {
  push(arguments);
}

/** The levels TermsFeed saved for this visitor, or null before any choice. */
export function readTermsFeedConsent() {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!entry) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(entry.slice(CONSENT_COOKIE.length + 1)));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function consentStateFor(levels) {
  const analytics = levels?.tracking === true ? "granted" : "denied";
  const ads = levels?.targeting === true ? "granted" : "denied";
  return {
    analytics_storage: analytics,
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  };
}

/** Apply a TermsFeed level map to Google Consent Mode. Null means no choice yet. */
export function applyTermsFeedConsent(levels) {
  if (!levels) return;
  gtag("consent", "update", consentStateFor(levels));
}
