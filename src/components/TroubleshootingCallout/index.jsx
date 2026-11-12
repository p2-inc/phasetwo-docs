import React from "react";
import Link from "@docusaurus/Link";
import { track } from "../../analytics";
import styles from "./styles.module.css";

/**
 * The in-body call to action on a troubleshooting post.
 *
 * It sits after the post's first diagnosis, where a reader who has just recognised their
 * error decides whether to keep reading. That is the reader the closing paragraph never
 * reaches. The post's own closing paragraph stays as it is.
 *
 * Two variants, because the honest offer differs by error:
 *
 *   proxy   The error comes from the proxy, TLS or hostname settings in front of
 *           Keycloak (502, redirect loops, missing login cookies). Managed hosting
 *           does remove this class of error, so the callout says so.
 *   config  The error is an application, client or role setting (redirect_uri,
 *           invalid_grant, CORS, 403). Managed hosting does not change that, and the
 *           callout says so, then names what it does take off the reader's hands.
 *
 * Do not write a variant that claims hosting fixes a setting the customer still owns.
 *
 * Measurement: every click sends `cta_click` to the dataLayer, which Tag Manager forwards
 * to GA4. The trial link also carries UTM parameters, so a dashboard signup started from
 * here is attributed to the post (`utm_content` is the `error` prop).
 */
const COPY = {
  proxy: (
    <>
      This error lives in the proxy, TLS and hostname settings in front of Keycloak.
      Phase Two runs managed Keycloak with those configured on day one.
    </>
  ),
  config: (
    <>
      This one is in your application or client configuration, and managed hosting will
      not change that for you. What Phase Two does take off your hands is everything
      underneath it: upgrades, the proxy, TLS and backups.
    </>
  ),
};

const TRIAL_URL = "https://dash.phasetwo.io/";

function trialHref(error) {
  const params = new URLSearchParams({
    utm_source: "phasetwo.io",
    utm_medium: "content_cta",
    utm_campaign: "troubleshooting",
    utm_content: error,
  });
  return `${TRIAL_URL}?${params.toString()}`;
}

export default function TroubleshootingCallout({ variant = "proxy", error }) {
  if (!COPY[variant]) {
    throw new Error(
      `TroubleshootingCallout: unknown variant "${variant}" (expected "proxy" or "config")`,
    );
  }
  if (!error) {
    throw new Error(
      "TroubleshootingCallout: the `error` prop is required; it names the post in analytics",
    );
  }

  const onClick = (target) => () =>
    track("cta_click", {
      cta_id: "troubleshooting_callout",
      cta_variant: variant,
      cta_target: target,
      cta_error: error,
    });

  return (
    <aside className={styles.wrapper} aria-label="Managed Keycloak">
      <p className={styles.kicker}>Running Keycloak yourself?</p>
      <p className={styles.body}>
        {COPY[variant]} 30-day free trial, then $149/month.
      </p>
      <p className={styles.actions}>
        <a
          className={styles.primary}
          href={trialHref(error)}
          target="_blank"
          rel="noreferrer"
          onClick={onClick("trial")}
        >
          Start a free trial
        </a>
        <Link
          className={styles.secondary}
          to="/hosting/dedicated-clusters/"
          onClick={onClick("hosting")}
        >
          How managed Keycloak works →
        </Link>
      </p>
    </aside>
  );
}
