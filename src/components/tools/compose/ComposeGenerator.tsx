import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "@docusaurus/Link";
import { Icon } from "@iconify/react";
import {
  generate,
  generateSecrets,
  DEFAULT_OPTIONS,
  VERSIONS,
  type ComposeOptions,
  type Database,
  type Secrets,
  type WarningLevel,
} from "./generate";

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-sm font-medium text-white">{label}</div>
      {children}
      {hint && <div className="mt-1.5 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

type Choice<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
  title?: string;
};

function Segmented<T extends string>({
  value,
  onChange,
  choices,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  choices: Choice<T>[];
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-black/20 p-1"
    >
      {choices.map((c) => (
        <button
          key={c.value}
          type="button"
          role="radio"
          aria-checked={value === c.value}
          disabled={c.disabled}
          title={c.title}
          onClick={() => onChange(c.value)}
          className={`flex-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
            value === c.value
              ? "bg-p2blue-500/20 text-white ring-1 ring-p2blue-500/50"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="mb-2.5 flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(ev) => onChange(ev.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-p2blue-500"
      />
      <span className="text-sm">
        <span className="text-white">{label}</span>
        {hint && <span className="block text-xs text-gray-500">{hint}</span>}
      </span>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500/60";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
    >
      <Icon
        icon={copied ? "mdi:check" : "mdi:content-copy"}
        className="size-3.5"
      />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function download(filename: string, content: string) {
  // octet-stream stops browsers from appending ".txt" to the name.
  const blob = new Blob([content], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function DownloadButton({
  filename,
  content,
}: {
  filename: string;
  content: string;
}) {
  return (
    <button
      type="button"
      aria-label={`Download ${filename}`}
      onClick={() => download(filename, content)}
      className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
    >
      <Icon icon="mdi:download" className="size-3.5" />
      Download
    </button>
  );
}

const WARNING_STYLES: Record<WarningLevel, { icon: string; cls: string }> = {
  danger: {
    icon: "mdi:alert-octagon",
    cls: "border-red-400/30 bg-red-400/5 text-red-300",
  },
  warning: {
    icon: "mdi:alert",
    cls: "border-amber-400/30 bg-amber-400/5 text-amber-200",
  },
  info: {
    icon: "mdi:information-outline",
    cls: "border-white/10 bg-white/[0.03] text-gray-300",
  },
};

/** Renders `code` spans written with backticks in generator text. */
function Ticks({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return <>{parts.map((p, i) => (i % 2 ? <code key={i}>{p}</code> : p))}</>;
}

/* ------------------------------------------------------------------ */
/* Bundled extensions note                                             */
/* ------------------------------------------------------------------ */

const EXTENSIONS: { label: string; to?: string }[] = [
  { label: "Organizations", to: "/extensions/organizations" },
  { label: "Events & webhooks", to: "/extensions/events" },
  { label: "Magic Link", to: "/extensions/magic-link" },
  { label: "Themes", to: "/extensions/themes" },
  { label: "Admin Portal", to: "/extensions/admin-portal" },
  { label: "IdP Wizards", to: "/extensions/idp-wizard" },
  { label: "User Migration", to: "/extensions/user-migration" },
  { label: "SCIM Server" },
  { label: "Atomic Auth Flows" },
  { label: "Sign in with Apple" },
];

function ExtensionsNote() {
  return (
    <div className="mt-2 rounded-xl border border-p2blue-500/20 bg-p2blue-500/[0.06] p-3 text-xs text-gray-300">
      <div className="mb-1.5 flex items-center gap-1.5 font-semibold uppercase tracking-wide text-p2blue-300">
        <Icon icon="mdi:puzzle-outline" className="size-4" />
        Bundled extensions
      </div>
      <p className="mb-0">
        {EXTENSIONS.map((x, i) => (
          <span key={x.label}>
            {x.to ? <Link to={x.to}>{x.label}</Link> : x.label}
            {i < EXTENSIONS.length - 1 ? ", " : ""}
          </span>
        ))}
        . Same Keycloak, same <code>KC_*</code> options, plus CockroachDB
        support. <Link to="/docs/hosting/docker">Image docs</Link>.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

const DB_CHOICES: Choice<Database>[] = [
  { value: "postgres", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "cockroach", label: "CockroachDB" },
  { value: "dev-file", label: "H2 (dev)" },
];

const CUSTOM = "__custom__";

export default function ComposeGenerator() {
  const [opts, setOpts] = useState<ComposeOptions>(DEFAULT_OPTIONS);
  const [customVersion, setCustomVersion] = useState(false);
  const [tab, setTab] = useState<"compose" | "env">("compose");
  // Secrets are generated only in the browser, after mount, so they never
  // end up in the statically rendered HTML.
  const [secrets, setSecrets] = useState<Secrets | null>(null);
  useEffect(() => setSecrets(generateSecrets()), []);

  const set = <K extends keyof ComposeOptions>(k: K, v: ComposeOptions[K]) =>
    setOpts((prev) => {
      const next = { ...prev, [k]: v };
      // Keep the database choice valid as the mode or image changes.
      if (next.mode === "prod" && next.database === "dev-file")
        next.database = "postgres";
      if (next.image !== "phasetwo" && next.database === "cockroach")
        next.database = "postgres";
      return next;
    });

  const placeholder: Secrets = {
    adminPassword: "generating…",
    dbPassword: "generating…",
    dbRootPassword: "generating…",
  };
  const out = useMemo(
    () => generate(opts, secrets ?? placeholder),
    [opts, secrets],
  );
  const o = out.options;
  const p2 = o.image === "phasetwo";

  const versionSelect = customVersion ? CUSTOM : o.version;

  const tabBtn = (key: "compose" | "env", text: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`rounded-md px-2.5 py-1 font-mono text-xs font-medium ${
        tab === key
          ? "bg-white/10 text-white"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {text}
    </button>
  );

  const fileName = tab === "compose" ? "docker-compose.yml" : ".env";
  const fileContent = tab === "compose" ? out.compose : out.env;

  return (
    <div className="not-prose">
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-2.5 text-sm text-green-300">
        <Icon icon="mdi:shield-lock" className="size-5 shrink-0" />
        <span>
          Generated entirely in your browser. Passwords are created locally with
          the Web Crypto API and never leave this page.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* LEFT: options */}
        <div className="rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-5">
          <SectionLabel>Image</SectionLabel>
          <Field label="Keycloak image">
            <Segmented
              label="Keycloak image"
              value={o.image}
              onChange={(v) => {
                setCustomVersion(false);
                setOpts((prev) => ({
                  ...prev,
                  image: v,
                  version: VERSIONS[v][0],
                  relativePath: v === "phasetwo" ? "/auth" : "/",
                  database:
                    v !== "phasetwo" && prev.database === "cockroach"
                      ? "postgres"
                      : prev.database,
                }));
              }}
              choices={[
                { value: "phasetwo", label: "Phase Two" },
                { value: "upstream", label: "Upstream Keycloak" },
              ]}
            />
            {p2 && <ExtensionsNote />}
          </Field>

          <Field
            label="Version"
            hint={
              p2 ? (
                <>
                  Pin a full <code>26.8.1.&lt;build-timestamp&gt;</code> tag in
                  production. See the{" "}
                  <a
                    href="https://quay.io/repository/phasetwo/phasetwo-keycloak?tab=tags"
                    target="_blank"
                    rel="noreferrer"
                  >
                    tag list
                  </a>
                  .
                </>
              ) : (
                "Options in this generator target Keycloak 26."
              )
            }
          >
            <div className="flex gap-2">
              <select
                aria-label="Version"
                value={versionSelect}
                onChange={(ev) => {
                  if (ev.target.value === CUSTOM) {
                    setCustomVersion(true);
                  } else {
                    setCustomVersion(false);
                    set("version", ev.target.value);
                  }
                }}
                className={`${inputCls} max-w-[11rem] font-sans`}
              >
                {VERSIONS[o.image].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
                <option value={CUSTOM}>Custom tag…</option>
              </select>
              {customVersion && (
                <input
                  aria-label="Custom tag"
                  className={inputCls}
                  value={opts.version}
                  placeholder="26.8.1.1793384608"
                  onChange={(ev) => set("version", ev.target.value)}
                />
              )}
            </div>
          </Field>

          <SectionLabel>Runtime</SectionLabel>
          <Field label="Mode">
            <Segmented
              label="Mode"
              value={o.mode}
              onChange={(v) => set("mode", v)}
              choices={[
                { value: "dev", label: "Development (start-dev)" },
                { value: "prod", label: "Production (start)" },
              ]}
            />
          </Field>

          <Field
            label="Database"
            hint={
              o.database === "cockroach"
                ? "Single insecure node, for local testing. CockroachDB support is specific to the Phase Two image."
                : o.database === "dev-file"
                  ? "Embedded H2 inside the container. Development mode only."
                  : undefined
            }
          >
            <Segmented
              label="Database"
              value={o.database}
              onChange={(v) => set("database", v)}
              choices={DB_CHOICES.map((c) => ({
                ...c,
                disabled:
                  (c.value === "cockroach" && !p2) ||
                  (c.value === "dev-file" && o.mode === "prod"),
                title:
                  c.value === "cockroach" && !p2
                    ? "Requires the Phase Two image"
                    : c.value === "dev-file" && o.mode === "prod"
                      ? "Development mode only"
                      : undefined,
              }))}
            />
          </Field>

          <SectionLabel>Network</SectionLabel>
          <Field label="How users reach Keycloak">
            <Segmented
              label="Exposure"
              value={o.exposure}
              onChange={(v) => set("exposure", v)}
              choices={[
                { value: "localhost", label: "localhost (HTTP)" },
                { value: "proxy", label: "Reverse proxy + TLS" },
                { value: "tls", label: "Direct TLS" },
              ]}
            />
          </Field>

          {o.exposure === "proxy" && (
            <Field
              label="Proxy"
              hint={
                o.proxy === "caddy"
                  ? "Caddy requests a Let's Encrypt certificate automatically. DNS for the hostname must point here and ports 80/443 must be reachable."
                  : "nginx terminates TLS with your certificate in ./certs."
              }
            >
              <Segmented
                label="Proxy"
                value={o.proxy}
                onChange={(v) => set("proxy", v)}
                choices={[
                  { value: "caddy", label: "Caddy (automatic TLS)" },
                  { value: "nginx", label: "nginx (your certificate)" },
                ]}
              />
            </Field>
          )}

          {o.exposure !== "localhost" ? (
            <Field label="Public hostname">
              <input
                aria-label="Public hostname"
                className={inputCls}
                value={opts.hostname}
                placeholder="auth.example.com"
                onChange={(ev) => set("hostname", ev.target.value)}
              />
            </Field>
          ) : (
            <Field label="Host port">
              <input
                aria-label="Host port"
                type="number"
                min={1}
                max={65535}
                className={`${inputCls} max-w-[8rem]`}
                value={opts.httpPort}
                onChange={(ev) => set("httpPort", Number(ev.target.value))}
              />
            </Field>
          )}

          <Field
            label="Path prefix"
            hint="Phase Two clusters and docs use /auth. Upstream Keycloak defaults to the root."
          >
            <Segmented
              label="Path prefix"
              value={o.relativePath === "/auth" ? "/auth" : "/"}
              onChange={(v) => set("relativePath", v)}
              choices={[
                { value: "/auth", label: "/auth" },
                { value: "/", label: "/ (root)" },
              ]}
            />
          </Field>

          <SectionLabel>Extras</SectionLabel>
          <Toggle
            checked={o.healthMetrics}
            onChange={(v) => set("healthMetrics", v)}
            label="Health checks and metrics"
            hint="Readiness check and Prometheus metrics on port 9000."
          />
          <Toggle
            checked={o.mailpit}
            onChange={(v) => set("mailpit", v)}
            label="Mailpit for email testing"
            hint="Catches outgoing mail; web UI on localhost:8025."
          />
          <Toggle
            checked={o.realmImport}
            onChange={(v) => set("realmImport", v)}
            label="Import realms from ./realms"
            hint="Runs --import-realm on startup."
          />
          <Toggle
            checked={o.themeName !== ""}
            onChange={(v) => set("themeName", v ? "my-theme" : "")}
            label="Mount a custom theme"
          />
          {o.themeName !== "" && (
            <div className="mb-3 pl-6">
              <input
                aria-label="Theme name"
                className={inputCls}
                value={opts.themeName}
                placeholder="my-theme"
                onChange={(ev) =>
                  set("themeName", ev.target.value || "my-theme")
                }
              />
            </div>
          )}
          <Toggle
            checked={o.defaultAdminPassword}
            onChange={(v) => set("defaultAdminPassword", v)}
            label="Use admin / admin"
            hint="Instead of a generated bootstrap admin password. Local only."
          />

          <Field label="JVM memory">
            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Container memory limit"
                value={o.memoryLimit}
                onChange={(ev) => set("memoryLimit", ev.target.value)}
                className={`${inputCls} max-w-[11rem] font-sans`}
              >
                <option value="">No limit</option>
                <option value="1g">1 GB limit</option>
                <option value="2g">2 GB limit</option>
                <option value="4g">4 GB limit</option>
              </select>
              <input
                aria-label="Heap options"
                className={`${inputCls} min-w-0 flex-1`}
                value={opts.heapOpts}
                placeholder="Heap flags, e.g. -Xms512m -Xmx1g"
                onChange={(ev) => set("heapOpts", ev.target.value)}
              />
            </div>
          </Field>
        </div>

        {/* RIGHT: output */}
        <div className="flex min-w-0 flex-col gap-4">
          {out.warnings.length > 0 && (
            <div className="flex flex-col gap-2" aria-live="polite">
              {out.warnings.map((w) => (
                <div
                  key={w.message}
                  className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${WARNING_STYLES[w.level].cls}`}
                >
                  <Icon
                    icon={WARNING_STYLES[w.level].icon}
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <span>{w.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-black/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
              <div className="flex items-center gap-1">
                {tabBtn("compose", "docker-compose.yml")}
                {tabBtn("env", ".env")}
              </div>
              <div className="flex items-center gap-1.5">
                {tab === "env" && (
                  <button
                    type="button"
                    onClick={() => setSecrets(generateSecrets())}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
                  >
                    <Icon icon="mdi:refresh" className="size-3.5" />
                    New passwords
                  </button>
                )}
                <CopyButton value={fileContent} label={fileName} />
                <DownloadButton
                  // Browsers refuse to save dotfiles, so .env downloads as
                  // keycloak.env; the run steps say to rename it.
                  filename={tab === "compose" ? fileName : "keycloak.env"}
                  content={fileContent}
                />
              </div>
            </div>
            <pre
              aria-label={fileName}
              className="m-0 max-h-[44rem] overflow-auto rounded-b-2xl bg-transparent p-4 font-mono text-[0.8rem] leading-relaxed text-gray-200"
            >
              {fileContent}
            </pre>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-5 text-sm text-gray-300">
            <SectionLabel>Run it</SectionLabel>
            <ol className="mb-0 list-decimal space-y-2 pl-5">
              <li>
                Save both files in an empty directory. The downloaded{" "}
                <code>keycloak.env</code> must be renamed to <code>.env</code>.
                Keep it out of version control.
              </li>
              {out.prerequisites.map((p) => (
                <li key={p}>Create {p}.</li>
              ))}
              <li>
                Start the stack and follow the logs:
                <div className="relative mt-1.5">
                  <pre className="m-0 overflow-x-auto rounded-lg bg-black/30 p-3 pr-20 font-mono text-xs text-gray-200">
                    {out.runCommand}
                  </pre>
                  <div className="absolute right-2 top-2">
                    <CopyButton value={out.runCommand} label="run command" />
                  </div>
                </div>
              </li>
              <li>
                Open <code>{out.url}</code> and sign in as <code>admin</code>{" "}
                with the password from <code>.env</code>.
              </li>
            </ol>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-5 text-sm text-gray-300">
            <SectionLabel>What this does</SectionLabel>
            <ul className="mb-0 list-disc space-y-1.5 pl-5">
              {out.explanation.map((x) => (
                <li key={x}>
                  <Ticks text={x} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
