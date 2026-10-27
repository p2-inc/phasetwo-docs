import React from "react";
import Layout from "@theme-original/Layout";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { applyTermsFeedConsent, readTermsFeedConsent } from "../../analytics";

if (ExecutionEnvironment.canUseEventListeners) {
  document.addEventListener("DOMContentLoaded", function () {
    cookieconsent.run({
      notice_banner_type: "simple",
      consent_type: "express",
      palette: "light",
      language: "en",
      page_load_consent_levels: ["strictly-necessary"],
      notice_banner_reject_button_hide: false,
      preferences_center_close_button_hide: false,
      page_refresh_confirmation_buttons: false,
      website_name: "Phase Two, Inc",
    });
  });
  // TermsFeed fires this after it has saved a choice, with the accepted levels
  // on the event. Consent Mode follows it; the tag itself is already loaded.
  document.addEventListener("cc_userConsentSaved", (event) => {
    applyTermsFeedConsent(event.details || readTermsFeedConsent());
  });
}
if (ExecutionEnvironment.canUseDOM) {
  // Returning visitor: replay the stored choice before the first hit goes out.
  // The inline default in the <head> waits up to 500ms for exactly this.
  applyTermsFeedConsent(readTermsFeedConsent());
}

function CookieAndAnalytics() {
  if (process.env.NODE_ENV === "production")
    return (
      <>
        <div
          dangerouslySetInnerHTML={{
            __html: `<noscript>Free cookie consent management tool by
        <a href="https://www.termsfeed.com/">TermsFeed</a></noscript>`,
          }}
        ></div>
      </>
    );
  return null;
}

export default function LayoutWrapper(props) {
  return (
    <>
      <Layout {...props}>
        {props.children}

        <CookieAndAnalytics />
      </Layout>
    </>
  );
}
