import React, { useEffect } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";
import { CheckMark } from "./index";
import { KeycloakSupportPackages } from "../components/keycloak-support-packages";
import { InlineIcon } from "@iconify/react";
import { useState } from "react";
import { Switch, Label, Field } from "@headlessui/react";
import cs from "classnames";
import DetailedPriceComparison from "../components/pricing/detailed-comparison";

function requestAccess() {
  window.open(`https://dash.phasetwo.io/`, "_blank");
}

function githubHome() {
  window.open(`https://github.com/p2-inc/`, "_blank");
}

const prices = {
  annual: {
    starter: 0,
    premium: 499,
    enterprise: 1999,
  },
  monthly: {
    starter: 0,
    premium: 749,
    enterprise: 2499,
  },
};

function Pricing() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  useEffect(() => {
    document.body.classList.add("page-bg");
  });

  const [term, setTerm] = useState(true);
  const billingTermValue = term ? "annual" : "monthly";
  const billingTerm = term ? prices["annual"] : prices["monthly"];

  return (
    <Layout description={`${siteConfig.tagline}`}>
      <main className="pt-24">
        <div className="container">
          <div className={`contentBlockHead`}>
            <h2 id="phaseTwoPricing">Premium Keycloak Hosting</h2>
            <p>
              Phase Two is one price per project. No hidden fees, no
              unpredictable costs.
            </p>
            <p className="mt-1r">
              We offer a premium hosted Keycloak product to make getting started
              fast and secure. Set up a free instance with our starter package
              to get a sense of the simplicity that comes with Phase Two
              Keycloak hosting.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.plansBlocks}>
              <div className={styles.plansBlock}>
                <div className={styles.plans}>
                  {/* Plan */}
                  <div className={styles.plan}>
                    <div className={styles.planHead}>
                      <img
                        className={styles.featCardPicto}
                        src="/img/plan-starter.svg"
                        alt="Starter plan"
                        loading="lazy"
                      />
                      <h3>Starter</h3>
                      <p>
                        Always FREE <sup>1</sup>
                      </p>
                    </div>
                    <div className={styles.planBody}>
                      <ul className={styles.checklist}>
                        <li>
                          <CheckMark />
                          Shared cluster
                        </li>
                        <li>
                          <CheckMark />
                          &#60;1,000 users
                        </li>
                        <li>
                          <CheckMark />
                          &#60;10 SSO connections
                        </li>
                        <li>
                          <CheckMark />
                          Community support
                        </li>
                        <li>
                          <InlineIcon
                            icon="fa6-solid:xmark"
                            className="absolute left-0 mt-2 h-auto w-[10px] text-red-500"
                          />{" "}
                          No SLA
                        </li>
                      </ul>
                    </div>
                    <div className={styles.planFoot}>
                      <button
                        className={`btnPrimary ${styles.btnPlan}`}
                        onClick={requestAccess}
                      >
                        Get started
                      </button>
                      <button
                        className={`btnSecondary ${styles.btnPlan}`}
                        onClick={githubHome}
                      >
                        Self Host
                      </button>
                    </div>
                  </div>

                  {/* Plan */}
                  <div className={styles.plan}>
                    <div className={styles.planBadge}>Most Popular</div>
                    <div className={styles.planHead}>
                      <img
                        className={styles.featCardPicto}
                        src="/img/plan-supported.svg"
                        alt="Premium plan"
                        loading="lazy"
                      />
                      <h3>Premium</h3>
                      <p>
                        <span className={styles.planFrom}>from</span>{" "}
                        <strong className={styles.planPrice}>
                          ${billingTerm.premium}
                        </strong>
                        /mo{" "}
                      </p>
                    </div>
                    <div className={styles.planBody}>
                      <ul className={styles.checklist}>
                        <li>
                          <CheckMark />
                          Dedicated cluster
                        </li>
                        <li>
                          <CheckMark />
                          Unlimited users
                        </li>
                        <li>
                          <CheckMark />
                          Unlimited SSO connections
                        </li>
                        <li>
                          <CheckMark />
                          Custom domain
                        </li>
                        <li>
                          <CheckMark />
                          CSS theme customization
                        </li>
                        <li>
                          <CheckMark />
                          Email support
                        </li>
                        <li>
                          <CheckMark />
                          99.9% uptime guarantee
                        </li>
                        <li>
                          <CheckMark />
                          <a href="/docs/sla/#response-and-resolution-times">
                            SLA
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className={styles.planFoot}>
                      <button
                        className={`btnPrimary ${styles.btnPlan}`}
                        onClick={requestAccess}
                      >
                        Get started
                      </button>
                    </div>
                  </div>

                  {/* Plan */}
                  <div className={styles.plan}>
                    <div className={styles.planHead}>
                      <img
                        className={styles.featCardPicto}
                        src="/img/plan-premium.svg"
                        alt="Enterprise plan"
                        loading="lazy"
                      />
                      <h3>Enterprise</h3>
                      <p>
                        <span className={styles.planFrom}>from</span>{" "}
                        <strong className={styles.planPrice}>
                          ${billingTerm.enterprise}
                        </strong>
                        /mo{" "}
                      </p>
                    </div>
                    <div className={styles.planBody}>
                      <ul className={styles.checklist}>
                        <li>
                          <CheckMark />
                          All Premium features
                        </li>
                        <li>
                          <CheckMark />
                          Global deployment(s)
                        </li>
                        <li>
                          <CheckMark />
                          Custom themes & extensions <sup>2</sup>
                        </li>
                        <li>
                          <CheckMark />
                          Dedicated support
                        </li>
                        <li>
                          <CheckMark />
                          Slack / Chat channel
                        </li>
                        <li>
                          <CheckMark />
                          99.99% uptime guarantee
                        </li>
                        <li>
                          <CheckMark />
                          <a href="/docs/sla/#response-and-resolution-times">
                            SLA
                          </a>
                          <sup>3</sup>
                        </li>
                      </ul>
                    </div>
                    <div className={styles.planFoot}>
                      <button
                        className={`btnPrimary ${styles.btnPlan}`}
                        onClick={requestAccess}
                      >
                        Get started
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`contentBlockCta flex items-baseline justify-center gap-3`}
          >
            <div className="text-lg">Billing period: </div>
            <Field className="flex items-center justify-center gap-2">
              <Label
                className={cs({
                  "font-bold": billingTermValue === "monthly",
                })}
              >
                Monthly
              </Label>
              <Switch
                checked={term}
                onChange={setTerm}
                className="group inline-flex h-6 w-11 items-center rounded-full bg-p2blue-600 transition data-[checked]:bg-p2blue-600"
              >
                <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
              </Switch>
              <Label
                className={cs({
                  "font-bold": billingTermValue === "annual",
                })}
              >
                Annual
              </Label>
            </Field>
          </div>
          <div className={`contentBlockCta`}>
            <p>
              (1) Subject to availabilty (2) Additional fees based on extension
              complexity (3) Custom SLA available
            </p>
            <p>
              For on-prem support and bundling options, please{" "}
              <a href="mailto:sales@phasetwo.io">contact sales</a>.
            </p>
          </div>
          <div className="contentBlock">
            <div className="contentBlockBody">
              <div>
                <h2
                  id="supportPackages"
                  style={{ textAlign: "center", marginTop: "3rem" }}
                >
                  Enterprise Keycloak Support Packages
                </h2>
                <a href="#experts"></a>

                <div
                  className={styles.planBody}
                  style={{ maxWidth: "760px", margin: "0 auto" }}
                >
                  <p>
                    Configuring, integrating and operating an Identity and
                    Access Management system can be daunting. The Support
                    package provides customers with the expertise on how to
                    implement Keycloak. This is separate from our hosting, but
                    can be bundled together (many customers do).
                  </p>
                  <p>
                    For both hosted, on-prem customers, or those with their own
                    Keycloak deployment, our goal is to create an understanding
                    in your organization of what is possible with Keycloak. We
                    want to support your goals as you adopt and implement
                    Keycloak in your products. Let us lend our expertise to
                    every step of your journey.
                  </p>
                </div>
              </div>
              <KeycloakSupportPackages />
            </div>
          </div>
        </div>
        <Switch
          checked={term}
          onChange={setTerm}
          className="group inline-flex h-6 w-11 items-center rounded-full bg-p2blue-600 transition data-[checked]:bg-p2blue-600"
        >
          <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
        </Switch>
        <DetailedPriceComparison term={billingTermValue} />
      </main>
    </Layout>
  );
}

export default Pricing;
