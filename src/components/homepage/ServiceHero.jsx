import Link from "@docusaurus/Link";

export default function ServiceHero() {
  return (
    <>
      <section className="homepage-section homepage-hero-section">
        <div className="relative isolate">
          <div>
            <div className="hero-boxes-container flex flex-col gap-0 md:flex-row">
              {/* Managed Keycloak Hosting Box */}
              <div className="hero-box hero-box-primary">
                <div className="hero-box-image mb-6">
                  <img
                    src="/img/hero-managed-keycloak-hosting.svg"
                    alt="Managed Keycloak Hosting"
                    className="hero-box-image-img"
                  />
                </div>

                <div className="hero-box-content">
                  <h1 className="mb-6 text-balance text-white">
                    Managed Keycloak Hosting
                  </h1>

                  <p className="mb-6 text-pretty text-gray-300">
                    Simple, Cost-Conscious, Customizable, Enhanced Keycloak
                    Hosting for 99% of Use-Cases.
                  </p>

                  <div className="mt-auto flex flex-col items-center justify-center gap-4">
                    {/* Mobile only: Get a Demo (primary) + Try for Free (secondary) */}
                    <button
                      className="btnPrimary min-w-[160px] md:hidden"
                      onClick={() => setDemoModalOpen(true)}
                    >
                      Get a Demo
                    </button>
                    <a
                      href="https://dash.phasetwo.io/"
                      target="_blank"
                      className="hidden md:block"
                    >
                      <button className="btnPrimary min-w-[160px]">
                        Try for Free
                      </button>
                    </a>
                    <a
                      href="https://dash.phasetwo.io/"
                      target="_blank"
                      className="md:hidden"
                    >
                      <button className="btnSecondary min-w-[160px]">
                        Try for Free
                      </button>
                    </a>
                    <Link href={"/hosting"} className="link-primary text-sm">
                      Learn more <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Enterprise Keycloak Support Box */}
              <div className="hero-box hero-box-secondary">
                <div className="hero-box-image mb-6">
                  <img
                    src="/img/hero-enterprise-keycloak-support.svg"
                    alt="Enterprise Keycloak Support"
                    className="hero-box-image-img"
                  />
                </div>

                <div className="hero-box-content">
                  <h1 className="mb-6 text-balance text-white">
                    Enterprise Keycloak Support
                  </h1>

                  <p className="mb-6 text-pretty text-gray-300">
                    Expert Keycloak Support for Enterprises Coming to or Using
                    Keycloak at any Level of Complexity.
                  </p>

                  <div className="mt-auto flex flex-col items-center justify-center gap-4">
                    <Link to="/contact">
                      <button className="btnPrimary btnSupport min-w-[160px]">
                        Contact
                      </button>
                    </Link>
                    <Link to="/support" className="link-secondary">
                      Learn more <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
