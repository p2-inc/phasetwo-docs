import React from "react";
import Layout from "@theme/Layout";
import styles from "./styles.module.css";

export default function Hosted() {
  return (
    <Layout title="Hosted Keycloak" description="Premium Hosted Keycloak">
      <div>
        <h1>Premium Hosting for Keycloak</h1>
        <p>
          Identity and Access Management are mission critical to any
          application.
        </p>
        <p>
          Hosting Keycloak and keeping up to date with version releases is not a
          simple task. As users of software ourselves, we wanted to remove the
          startup friction that inevitably comes with setting up a new software
          stack.
        </p>
      </div>

      <div>
        <h2>Our Focus</h2>

        <p>Simple</p>
        <ul>
          <li>
            Integrating IAM to your application should be the number one
            priority.
          </li>
          <li>
            Moonlighting as DevOps distracts from the core competency of the
            business.
          </li>
        </ul>
        <p>Secure</p>
        <ul>
          <li>
            Keycloak releases major upgrades on a steady cadence and upgrading
            is fraught with many challenges. We make sure that we test and
            harden any release before it is rolled out to our clusters.
          </li>
        </ul>
        <p>Resilient</p>
        <ul>
          <li>
            Our globally deployed clusters are set-up to handle service
            interruptions. Our focus is ensuring your App can rely on a key
            foundational service.
          </li>
        </ul>
      </div>

      <div>
        <h2>What&apos;s right for me?</h2>
        <p>Free / Premium / Enterprise</p>
        <p>
          Understanding your app&apos;s use case is critical to determining what
          tier you will need. The main factors to consider are
        </p>

        <ul>
          <li>Number of users</li>
          <li>Branding customization</li>
          <li>Support for complex use cases</li>
        </ul>

        <p>
          These questions can help you determine the right tier you&apos;ll
          need.
        </p>
        <ul>
          <li>
            Just starting out and wanting to test things, our Free (forever)
            tier will make it possible to figure out how to start leveraging
            Phase Two.
          </li>
          <li>
            You already have an existing Saas application and already use or are
            transitioning to Keycloak. You will want a dedicated cluster for
            your use case.
          </li>
          <li>
            You have a global user base. You need to support a global deployment
            that keeps your clusters and sessions synchronized.
          </li>
          <li>
            You need additional customization to handle complex use cases. Our
            Enterprise offering ensures that no matter how you plan to use Phase
            Two (and Keycloak) it will be handled.
          </li>
        </ul>
      </div>

      <div>
        <h2>Why you should trust us?</h2>

        <p>
          We&apos;ve been working with Keycloak for approaching 8 years. Since
          some of its earliest releases, we&apos;ve been involved with the
          community and development.
        </p>
        <p>
          We know how powerful it is and we know the things to watch out for.
        </p>
        <p>
          We&apos;re passionate about the community (750+ stars on Github). When
          we see needs for additional functionality, like our Organizations
          extension, we build and release those to benefit all. We derive so
          much benefit from the community and believe strongly in giving that
          right back.
        </p>
        <p>Links to Keycloak Dev Forums</p>
        <p>
          Our team knows how to ship. We&apos;re startup veterans that know
          shipping product matters. We fix bugs fast. We&apos;re not afraid of a
          challenge.
        </p>
      </div>

      <button>Try Phase Two for free</button>
      <button>Let&apos;s talk =&gt; link to schedule a time</button>
    </Layout>
  );
}
