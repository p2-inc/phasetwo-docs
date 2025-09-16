import { InlineIcon } from "@iconify/react";
import Layout from "@theme/Layout";

export default function Contact() {
  return (
    <Layout
      title="Contact"
      description="Contact Phase Two for help with support, sales, or bug reports."
    >
      <div className="isolate px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Contact Phase Two
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600">
            Get in touch with us for help with support, sales, or bug reports.
            For customers experiencing an outage, please{" "}
            <a href="mailto:support@phasetwo.io">email</a>, call the support
            number, or use your customer service portal.
          </p>
        </div>
        <div className="mx-auto mt-20 grid max-w-3xl grid-cols-1 gap-4 sm:gap-y-16 md:grid-cols-2">
          <div className="flex gap-x-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-600">
              <InlineIcon
                aria-hidden="true"
                className="size-6 text-white"
                icon="mdi:computer"
              />
            </div>
            <div>
              <h3 className="text-base/7 font-semibold text-gray-900">
                Technical support (customers)
              </h3>
              <p className="mt-2 text-base/7 text-gray-600">
                Issues or problems with hosting or support? If you have a
                service portal, please use that for fastest escalation.
              </p>
              <p className="mt-4 flex flex-col gap-2 text-sm/6 font-semibold">
                <a
                  href="help.phasetwo.io"
                  target="_blank"
                  className="flex items-center gap-1 text-sky-600"
                >
                  <InlineIcon icon="mdi:headset" />
                  help.phasetwo.io <InlineIcon icon="mdi:open-in-new" />
                </a>
                <a href="mailto:support@phasetwo.io" className="text-sky-600">
                  support@phasetwo.io
                </a>
              </p>
            </div>
          </div>

          <div className="flex gap-x-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-600">
              <InlineIcon
                aria-hidden="true"
                className="size-6 text-white"
                icon="mdi:alert-box"
              />
            </div>
            <div>
              <h3 className="text-base/7 font-semibold text-gray-900">
                Emergency Keycloak Assistance
              </h3>
              <p className="mt-2 text-base/7 text-gray-600">
                If you are experiencing an outage or critical issue, related to
                Keycloak, and want to engage Phase Two services.
              </p>
              <p className="mt-4 flex flex-col gap-2 text-sm/6 font-semibold">
                {/* <a
                  href="help.phasetwo.io"
                  target="_blank"
                  className="flex items-center gap-1 text-sky-600"
                >
                  <InlineIcon icon="mdi:headset" />
                  help.phasetwo.io <InlineIcon icon="mdi:open-in-new" />
                </a> */}
                <a href="mailto:support@phasetwo.io" className="text-sky-600">
                  support@phasetwo.io
                </a>
              </p>
            </div>
          </div>
          <div className="flex gap-x-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-600">
              <InlineIcon
                aria-hidden="true"
                className="size-6 text-white"
                icon="mdi:chat"
              />
            </div>
            <div>
              <h3 className="text-base/7 font-semibold text-gray-900">Sales</h3>
              <p className="mt-2 text-base/7 text-gray-600">
                We keep it simple with email. We respond quick.
              </p>
              <p className="mt-4 text-sm/6 font-semibold">
                <a href="mailto:sales@phasetwo.io" className="text-sky-600">
                  sales@phasetwo.io
                </a>
              </p>
            </div>
          </div>
          <div className="flex gap-x-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-600">
              <InlineIcon
                aria-hidden="true"
                className="size-6 text-white"
                icon="mdi:bug"
              />
            </div>
            <div>
              <h3 className="text-base/7 font-semibold text-gray-900">
                Bug reports &amp; Feature requests
              </h3>
              <p className="mt-2 text-base/7 text-gray-600">
                Please file on Github for issues or feature requests related to
                our open source projects.
              </p>
              <p className="mt-4 text-sm/6 font-semibold">
                <a
                  href="https://github.com/p2-inc/phasetwo/issues"
                  target="_blank"
                  className="text-sky-600"
                >
                  Report a bug <span aria-hidden="true">&rarr;</span>
                </a>
              </p>
            </div>
          </div>
          <div className="flex gap-x-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-600">
              <InlineIcon
                aria-hidden="true"
                className="size-6 text-white"
                icon="mdi:shield-lock-outline"
              />
            </div>
            <div>
              <h3 className="text-base/7 font-semibold text-gray-900">
                Security Reports
              </h3>
              <p className="mt-2 text-base/7 text-gray-600">
                Please email us directly with any security issues. For bugs and
                critical issues reported, a bug bounty may be available.
              </p>
              <p className="mt-4 text-sm/6 font-semibold">
                <a href="mailto:support@phasetwo.io" className="text-sky-600">
                  support@phasetwo.io
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
