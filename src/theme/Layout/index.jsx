import React, { useEffect } from "react";
import Layout from "@theme-original/Layout";
import useTrackPageViews from "../../useTrackPageViews";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

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
}
if (ExecutionEnvironment.canUseDOM) {
  function gtag() {
    dataLayer.push(arguments);
  }
  (window.dataLayer = window.dataLayer || []),
    gtag("js", new Date()),
    gtag("config", "UA-160183620-1", {});
  window.gtag = gtag;
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
  useTrackPageViews();

  useEffect(() => {}, []);
  return (
    <>
      <Layout {...props}>
        {props.children}

        <CookieAndAnalytics />
      </Layout>
    </>
  );
}
