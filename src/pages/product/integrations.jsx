import Layout from "@theme/Layout";
import styles from "./integrations.module.css";
import { InlineIcon } from "@iconify/react";

function Integrations() {
  return (
    <Layout
      title="Integrations"
      description="Easily integrate Phase Two with many identity providers and application frameworks."
    >
      <main>
        {/* Hero */}
        <div className={`pageHero`}>
          <div className={`pageHeroBgCircles`}>
            <img
              src="/img/circles.svg"
              alt="Concentric Circles"
              loading="lazy"
            />
          </div>
          <div className={`pageHeroMsg`}>
            <h1>Integrate with Existing Identity Providers and Frameworks</h1>
            <h2 className={`pageHeroMsgIntro`}>
              Set up Phase Two to work with your existing identity provider
              which can include any social login, SAML, or OAuth provider. We
              also provide SDKs for popular application frameworks.
            </h2>
            <div className={`pageHeroCta`}>
              <a href="mailto:support@phasetwo.io">
                <button className={`btnPrimary`}>Contact Sales</button>
              </a>
            </div>
          </div>
        </div>

        {/* Protocols */}
        <div className={`contentBlock margin-bottom--sm`}>
          <div className={`text--center`}>
            <h2>Protocol Support</h2>
            <h3 className={`pageHeroMsgIntro`}>
              Phase Two supports the most common protocols for seamless
              integration with <b>any system</b>.
            </h3>
            <div
              className={`${styles.gridGroup} ${styles.gridGroupProtocol} padding-vert--lg`}
            >
              <div className={styles.gridGroupItem} title="SAML">
                <img
                  src="/img/saml.svg"
                  alt="SAML"
                  loading="lazy"
                  width="72"
                  height="22"
                />
                <span className="sr-only">SAML</span>
              </div>
              <div className={styles.gridGroupItem} title="OpenID">
                <img
                  src="/img/openid.svg"
                  alt="OpenID"
                  loading="lazy"
                  width="93"
                  height="32"
                />
                <span className="sr-only">OpenID</span>
              </div>
            </div>
          </div>
        </div>

        {/* Identity Providers */}
        <div className={`contentBlock  margin-bottom--sm`}>
          <div className={`text--center`}>
            <h2>Identity Providers</h2>
            <h3 className={`pageHeroMsgIntro`}>
              Phase Two works out of the box with all of the following Identity
              Providers and enables all{" "}
              <a href="https://phasetwo.io/product/organizations">
                Organization
              </a>{" "}
              admins to set up configured their chosen Identity Providers using
              the{" "}
              <a href="https://phasetwo.io/product/adminportal/">
                Admin Portal
              </a>
              .
            </h3>
            <div
              className={`${styles.gridGroup} ${styles.gridGroupIDP} padding-vert--lg`}
            >
              <div className={styles.gridGroupItem} title="Bitbucket">
                <InlineIcon
                  icon="fa-brands:bitbucket"
                  style={{ fontSize: "2rem" }}
                  alt="Bitbucket"
                />
                <span className="sr-only">Bitbucket</span>
              </div>
              <div className={styles.gridGroupItem} title="Facebook">
                <InlineIcon
                  icon="fa-brands:facebook"
                  style={{ fontSize: "2rem" }}
                  alt="Facebook"
                />
                <span className="sr-only">Facebook</span>
              </div>
              <div className={styles.gridGroupItem} title="Github">
                <InlineIcon
                  icon="fa-brands:github"
                  style={{ fontSize: "2rem" }}
                  alt="Github"
                />
                <span className="sr-only">Github</span>
              </div>
              <div className={styles.gridGroupItem} title="Gitlab">
                <InlineIcon
                  icon="fa-brands:gitlab"
                  style={{ fontSize: "2rem" }}
                  alt="Gitlab"
                />
                <span className="sr-only">Gitlab</span>
              </div>
              <div className={styles.gridGroupItem} title="Google">
                <InlineIcon
                  icon="fa-brands:google"
                  style={{ fontSize: "2rem" }}
                  alt="Google"
                />
                <span className="sr-only">Google</span>
              </div>
              <div className={styles.gridGroupItem} title="Instagram">
                <InlineIcon
                  icon="fa-brands:instagram"
                  style={{ fontSize: "2rem" }}
                  alt="Instagram"
                />
                <span className="sr-only">Instagram</span>
              </div>
              <div className={styles.gridGroupItem} title="LinkedIn">
                <InlineIcon
                  icon="fa-brands:linkedin"
                  style={{ fontSize: "2rem" }}
                  alt="LinkedIn"
                />
                <span className="sr-only">LinkedIn</span>
              </div>
              <div className={styles.gridGroupItem} title="Microsoft">
                <InlineIcon
                  icon="fa-brands:microsoft"
                  style={{ fontSize: "2rem" }}
                  alt="Microsoft"
                />
                <span className="sr-only">Microsoft</span>
              </div>
              <div className={styles.gridGroupItem} title="Azure">
                <InlineIcon
                  icon="devicon-plain:azure"
                  style={{ fontSize: "2rem" }}
                  alt="Azure"
                />
                <span className="sr-only">Azure</span>
              </div>
              <div className={styles.gridGroupItem} title="Openshift">
                <InlineIcon
                  icon="carbon:logo-openshift"
                  style={{ fontSize: "2rem" }}
                  alt="Openshift"
                />
                <span className="sr-only">Openshift</span>
              </div>
              <div className={styles.gridGroupItem} title="Paypal">
                <InlineIcon
                  icon="fa-brands:paypal"
                  style={{ fontSize: "2rem" }}
                  alt="Paypal"
                />
                <span className="sr-only">Paypal</span>
              </div>
              <div className={styles.gridGroupItem} title="StackOverflow">
                <InlineIcon
                  icon="fa-brands:stack-overflow"
                  style={{ fontSize: "2rem" }}
                  alt="StackOverflow"
                />
                <span className="sr-only">StackOverflow</span>
              </div>
              <div className={styles.gridGroupItem} title="X">
                <InlineIcon
                  icon="fa6-brands:x-twitter"
                  style={{ fontSize: "2rem" }}
                  alt="X"
                />
                <span className="sr-only">X</span>
              </div>
              <div className={styles.gridGroupItem} title="Onelogin">
                <img
                  src="/img/logo-onelogin.svg"
                  alt="Onelogin"
                  loading="lazy"
                  height="20"
                />
                <span className="sr-only">Onelogin</span>
              </div>
              <div className={styles.gridGroupItem} title="ADFS">
                <img
                  src="/img/logo-adfs.svg"
                  alt="ADFS"
                  loading="lazy"
                  height="20"
                />
                <span className="sr-only">ADFS</span>
              </div>
              <div className={styles.gridGroupItem} title="PingIdentity">
                <img
                  src="/img/logo-ping-identity-black.svg"
                  alt="PingIdentity"
                  loading="lazy"
                  height="20"
                />
                <span className="sr-only">PingIdentity</span>
              </div>
              <div className={styles.gridGroupItem} title="DUO">
                <img
                  src="/img/logo-duo-security-black.svg"
                  alt="DUO"
                  loading="lazy"
                  height="20"
                />
                <span className="sr-only">DUO</span>
              </div>
              <div className={styles.gridGroupItem} title="JumpCloud">
                <img
                  src="/img/logo-jumpcloud-logo.svg"
                  alt="JumpCloud"
                  loading="lazy"
                  height="20"
                />
                <span className="sr-only">JumpCloud</span>
              </div>
            </div>
          </div>
        </div>

        {/* Protocols */}
        <div className={`contentBlock `}>
          <div className={`kubernetesBgImg bgImg`}>
            <img
              src="/img/gradient-bg.webp"
              alt="Color Gradient"
              loading="lazy"
            />
          </div>
          <div className={`text--center`}>
            <h2>Framework Support</h2>
            <h3 className={`pageHeroMsgIntro`}>
              Phase Two can secure{" "}
              <a href="https://phasetwo.io/docs/securing-applications/">
                web frameworks
              </a>{" "}
              or native applications to provide authentication and authorization
              services.
            </h3>
            <div
              className={`${styles.gridGroup} ${styles.gridGroupFramework} padding-vert--lg`}
            >
              <a
                href="https://phasetwo.io/docs/securing-applications/django"
                title="Django"
              >
                <div className={styles.gridGroupItem}>
                  <InlineIcon
                    icon="simple-icons:django"
                    style={{ fontSize: "2rem" }}
                    alt="django"
                  />
                  <span className="sr-only">Django</span>
                </div>
              </a>
              <a
                href="https://phasetwo.io/docs/securing-applications/springboot"
                title="Spring Boot"
              >
                <div className={styles.gridGroupItem}>
                  <InlineIcon
                    icon="simple-icons:spring"
                    style={{ fontSize: "2rem" }}
                    alt="spring boot"
                  />
                  <span className="sr-only">Spring Boot</span>
                </div>
              </a>
              <a
                href="https://phasetwo.io/docs/securing-applications/javascript"
                title="Javascript"
              >
                <div className={styles.gridGroupItem}>
                  <InlineIcon
                    icon="simple-icons:javascript"
                    style={{ fontSize: "2rem" }}
                    alt="javascript"
                  />
                  <span className="sr-only">Javascript</span>
                </div>
              </a>
              <div className={styles.gridGroupItem} title="nodejs">
                <InlineIcon
                  icon="simple-icons:nodedotjs"
                  style={{ fontSize: "2rem" }}
                  alt="nodejs"
                />
                <span className="sr-only">nodejs</span>
              </div>
              <a
                href="https://phasetwo.io/docs/securing-applications/react"
                title="React"
              >
                <div className={styles.gridGroupItem}>
                  <InlineIcon
                    icon="simple-icons:react"
                    style={{ fontSize: "2rem" }}
                    alt="react"
                  />
                  <span className="sr-only">React</span>
                </div>
              </a>
              <a href="https://phasetwo.io/docs/securing-applications/next">
                <div className={styles.gridGroupItem} title="Next.js">
                  <InlineIcon
                    icon="simple-icons:nextdotjs"
                    style={{ fontSize: "2rem" }}
                    alt="next.js"
                  />
                  <span className="sr-only">Next.js</span>
                </div>
              </a>
              <a
                href="https://phasetwo.io/docs/securing-applications/vue"
                title="Vue"
              >
                <div className={styles.gridGroupItem}>
                  <InlineIcon
                    icon="simple-icons:vuedotjs"
                    style={{ fontSize: "2rem" }}
                    alt="vue"
                  />
                  <span className="sr-only">Vue</span>
                </div>
              </a>
              <a
                href="https://phasetwo.io/docs/securing-applications/nuxt"
                title="Nuxt"
              >
                <div className={styles.gridGroupItem}>
                  <InlineIcon
                    icon="simple-icons:nuxtdotjs"
                    style={{ fontSize: "2rem" }}
                    alt="nuxt"
                  />
                  <span className="sr-only">Nuxt</span>
                </div>
              </a>
              <a
                href="https://phasetwo.io/docs/securing-applications/remix"
                title="Remix"
              >
                <div className={styles.gridGroupItem}>
                  <InlineIcon
                    icon="simple-icons:remix"
                    style={{ fontSize: "2rem" }}
                    alt="remix"
                  />
                  <span className="sr-only">Remix</span>
                </div>
              </a>
              <a
                href="https://phasetwo.io/docs/securing-applications/sveltekit"
                title="Sveltekit"
              >
                <div className={styles.gridGroupItem}>
                  <InlineIcon
                    icon="simple-icons:svelte"
                    style={{ fontSize: "2rem" }}
                    alt="sveltekit"
                  />
                  <span className="sr-only">Sveltekit</span>
                </div>
              </a>
              <a
                href="https://phasetwo.io/docs/securing-applications/angular"
                title="Angular"
              >
                <div className={styles.gridGroupItem}>
                  <InlineIcon
                    icon="simple-icons:angular"
                    style={{ fontSize: "2rem" }}
                    alt="angular"
                  />
                  <span className="sr-only">Angular</span>
                </div>
              </a>
              <div className={styles.gridGroupItem} title="GoLang">
                <InlineIcon
                  icon="fa6-brands:golang"
                  style={{ fontSize: "2rem" }}
                  alt="golang"
                />
                <span className="sr-only">GoLang</span>
              </div>
              <div className={styles.gridGroupItem} title="Android">
                <InlineIcon
                  icon="simple-icons:android"
                  style={{ fontSize: "2rem" }}
                  alt="android"
                />
                <span className="sr-only">Android</span>
              </div>
              <div className={styles.gridGroupItem} title="Apple">
                <InlineIcon
                  icon="simple-icons:apple"
                  style={{ fontSize: "2rem" }}
                  alt="apple"
                />
                <span className="sr-only">Apple</span>
              </div>
              <div className={styles.gridGroupItem} title="php">
                <InlineIcon
                  icon="simple-icons:php"
                  style={{ fontSize: "2rem" }}
                  alt="php"
                />
                <span className="sr-only">php</span>
              </div>
              <div className={styles.gridGroupItem} title="c#">
                <InlineIcon
                  icon="devicon-plain:csharp"
                  style={{ fontSize: "2rem" }}
                  alt="c-sharp"
                />
                <span className="sr-only">c-sharp</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contentBlock">
          <div className="contentBlockBody">
            <div className={`${styles.callout} card`}>
              <h4 className={styles.calloutHeader}>
                Learn more about Phase Two's Integrations
              </h4>
              <div className="margin-top--md">
                <a
                  href="mailto:sales@phasetwo.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="margin-right--md"
                >
                  <button className="btnTertiary">
                    Let&apos;s Talk About It
                  </button>
                </a>
                <a
                  href="https://phasetwo.io/dashboard/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="btnTertiary margin-right--md">
                    Get Started For Free
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Integrations;
