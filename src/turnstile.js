/**
 * Loads Cloudflare Turnstile the first time a form needs it.
 *
 * Only the demo modal and the case-studies form use Turnstile, so it is not in
 * docusaurus.config.js `scripts` and does not load on every page. Both forms
 * call this when they open and then wait for `window.turnstile` as before.
 */

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export function loadTurnstile() {
  if (typeof document === "undefined") return;
  if (
    window.turnstile ||
    document.querySelector(`script[src="${TURNSTILE_SRC}"]`)
  )
    return;
  const script = document.createElement("script");
  script.src = TURNSTILE_SRC;
  script.async = true;
  document.head.appendChild(script);
}
