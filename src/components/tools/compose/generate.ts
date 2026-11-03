/**
 * Framework-free generator for Keycloak docker-compose.yml + .env files.
 *
 * Everything here is pure and deterministic given its inputs (randomness is
 * injected), so it runs the same in the browser and under `node --test`.
 * Keep this file free of imports: Node's type stripping runs it directly in
 * the unit tests.
 */

export type ImageKind = "phasetwo" | "upstream";
export type Mode = "dev" | "prod";
export type Database =
  "postgres" | "mysql" | "mariadb" | "cockroach" | "dev-file";
export type Exposure = "localhost" | "proxy" | "tls";
export type ProxyKind = "caddy" | "traefik" | "nginx";
/** Where Caddy/Traefik get their certificate. nginx always uses ./certs. */
export type ProxyCert = "letsencrypt" | "selfsigned";

export interface ComposeOptions {
  image: ImageKind;
  /** Image tag, e.g. "26.8.1". */
  version: string;
  mode: Mode;
  database: Database;
  exposure: Exposure;
  proxy: ProxyKind;
  proxyCert: ProxyCert;
  /** Optional Let's Encrypt account email (Caddy / Traefik). */
  acmeEmail: string;
  /** Public hostname (proxy / tls modes). */
  hostname: string;
  /** Host port published in localhost mode. */
  httpPort: number;
  /** HTTP relative path: "/auth" (Phase Two convention) or "/". */
  relativePath: string;
  healthMetrics: boolean;
  mailpit: boolean;
  realmImport: boolean;
  /** Custom theme directory name to mount, or "" for none. */
  themeName: string;
  /** Container memory limit, e.g. "2g", or "" for none. */
  memoryLimit: string;
  /** Explicit JVM heap flags (JAVA_OPTS_KC_HEAP), or "" for the default. */
  heapOpts: string;
  /** Use admin/admin instead of a generated admin password. */
  defaultAdminPassword: boolean;
}

export interface Secrets {
  adminPassword: string;
  dbPassword: string;
  dbRootPassword: string;
}

export type WarningLevel = "danger" | "warning" | "info";

export interface Warning {
  level: WarningLevel;
  message: string;
}

export interface GeneratedFiles {
  compose: string;
  env: string;
  warnings: Warning[];
  /** Plain-English bullets describing what the configuration does. */
  explanation: string[];
  /** Directories/files the user must create next to docker-compose.yml. */
  prerequisites: string[];
  runCommand: string;
  /** Where to open Keycloak once it is up. */
  url: string;
  /** The options actually used, after normalization. */
  options: ComposeOptions;
}

export const PHASETWO_IMAGE = "quay.io/phasetwo/phasetwo-keycloak";
export const UPSTREAM_IMAGE = "quay.io/keycloak/keycloak";

/**
 * The newest Keycloak release, the only version number to edit when Keycloak
 * ships. Every tag in the picker and every example in the UI derives from it.
 *
 * To bump: list the tags with
 *   curl -s 'https://quay.io/api/v1/repository/phasetwo/phasetwo-keycloak/tag/?limit=20&onlyActiveTags=true'
 * set KEYCLOAK_VERSION to the newest MAJOR.MINOR.PATCH that both
 * quay.io/phasetwo/phasetwo-keycloak and quay.io/keycloak/keycloak publish,
 * EXAMPLE_BUILD_TAG to a full Phase Two build tag for it, and
 * VERSIONS_CHECKED_ON to today. `npm test` fails once VERSIONS_CHECKED_ON is
 * older than VERSIONS_MAX_AGE_DAYS, as a reminder.
 */
export const KEYCLOAK_VERSION = "26.8.1";
export const EXAMPLE_BUILD_TAG = "26.8.1.1793384608";
export const VERSIONS_CHECKED_ON = "2026-11-02";
export const VERSIONS_MAX_AGE_DAYS = 45;

const [KC_MAJOR, KC_MINOR] = KEYCLOAK_VERSION.split(".");

/** Tags offered in the version picker. The first entry is the default. */
export const VERSIONS: Record<ImageKind, string[]> = {
  phasetwo: [KEYCLOAK_VERSION, `${KC_MAJOR}.${KC_MINOR}`, KC_MAJOR, "latest"],
  upstream: [KEYCLOAK_VERSION, `${KC_MAJOR}.${KC_MINOR}`, "latest"],
};
export const KEYCLOAK_MAJOR = KC_MAJOR;

export const DB_IMAGES = {
  postgres: "postgres:17-alpine",
  mysql: "mysql:8.4",
  mariadb: "mariadb:11.4",
  cockroach: "cockroachdb/cockroach:v25.2.6",
} as const;

export const CADDY_IMAGE = "caddy:2-alpine";
export const TRAEFIK_IMAGE = "traefik:v3.5";
export const NGINX_IMAGE = "nginx:1.28-alpine";
export const MAILPIT_IMAGE = "axllent/mailpit:v1.27";

/** Build options the Phase Two extensions expect (see the image docs). */
export const PHASETWO_SPI_FLAGS = [
  "--spi-email-template--provider=freemarker-plus-mustache",
  "--spi-email-template--freemarker-plus-mustache--enabled=true",
  "--spi-theme--cache-themes=false",
];

export const DEFAULT_OPTIONS: ComposeOptions = {
  image: "phasetwo",
  version: VERSIONS.phasetwo[0],
  mode: "dev",
  database: "postgres",
  exposure: "localhost",
  proxy: "caddy",
  proxyCert: "letsencrypt",
  acmeEmail: "",
  hostname: "auth.example.com",
  httpPort: 8080,
  relativePath: "/auth",
  healthMetrics: true,
  mailpit: false,
  realmImport: false,
  themeName: "",
  memoryLimit: "",
  heapOpts: "",
  defaultAdminPassword: false,
};

/* ------------------------------------------------------------------ */
/* Secrets                                                             */
/* ------------------------------------------------------------------ */

const PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/**
 * Random alphanumeric password. Alphanumeric only, so the value never needs
 * quoting in .env and never triggers Compose `$` interpolation.
 * `randomBytes` defaults to the Web Crypto API (browser and Node 20+).
 */
export function randomPassword(
  length = 24,
  randomBytes: (n: number) => Uint8Array = (n) =>
    globalThis.crypto.getRandomValues(new Uint8Array(n)),
): string {
  const out: string[] = [];
  // Rejection sampling avoids modulo bias.
  const limit = 256 - (256 % PASSWORD_ALPHABET.length);
  while (out.length < length) {
    for (const b of randomBytes(length * 2)) {
      if (b < limit) out.push(PASSWORD_ALPHABET[b % PASSWORD_ALPHABET.length]);
      if (out.length === length) break;
    }
  }
  return out.join("");
}

export function generateSecrets(
  randomBytes?: (n: number) => Uint8Array,
): Secrets {
  return {
    adminPassword: randomPassword(24, randomBytes),
    dbPassword: randomPassword(24, randomBytes),
    dbRootPassword: randomPassword(24, randomBytes),
  };
}

/* ------------------------------------------------------------------ */
/* Minimal YAML emitter (block style, with comments)                   */
/* ------------------------------------------------------------------ */

type Scalar = string | number | boolean;
type YNode = Scalar | YNode[] | YMap;
interface YEntry {
  key: string;
  value: YNode;
  comment?: string;
}
interface YMap {
  __map: YEntry[];
}

function ymap(...entries: (YEntry | null | false | undefined)[]): YMap {
  return { __map: entries.filter(Boolean) as YEntry[] };
}
function e(key: string, value: YNode, comment?: string): YEntry {
  return { key, value, comment };
}
function isMap(n: YNode): n is YMap {
  return typeof n === "object" && n !== null && "__map" in n;
}

const RESERVED = /^(true|false|yes|no|on|off|null|y|n|~)$/i;
const PLAIN_SAFE = /^[A-Za-z_./~-][A-Za-z0-9_\-./:@=+~,]*$/;
/** Durations and sizes such as 10s, 90s, 2g: strings YAML never coerces. */
const UNIT_VALUE = /^\d+[a-z]+$/;

function scalar(v: Scalar): string {
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (UNIT_VALUE.test(v)) return v;
  if (
    v !== "-" &&
    !v.startsWith("---") &&
    PLAIN_SAFE.test(v) &&
    !RESERVED.test(v) &&
    !v.endsWith(":") &&
    !/^[\d.:]+$/.test(v)
  ) {
    return v;
  }
  return JSON.stringify(v);
}

function emitComment(comment: string | undefined, pad: string): string {
  if (!comment) return "";
  return comment
    .split("\n")
    .map((l) => `${pad}# ${l}\n`)
    .join("");
}

function emitBlockString(s: string, pad: string): string {
  const indicator = s.endsWith("\n") ? "|" : "|-";
  const body = s
    .replace(/\n$/, "")
    .split("\n")
    .map((l) => (l.length ? `${pad}${l}` : ""))
    .join("\n");
  return `${indicator}\n${body}\n`;
}

function emitMap(m: YMap, indent: number): string {
  const pad = " ".repeat(indent);
  let out = "";
  for (const { key, value, comment } of m.__map) {
    out += emitComment(comment, pad);
    out += `${pad}${key}:${emitValue(value, indent)}`;
  }
  return out;
}

/** Emits the part after `key:` (leading space or newline included). */
function emitValue(value: YNode, indent: number): string {
  if (typeof value === "string" && value.includes("\n")) {
    return " " + emitBlockString(value, " ".repeat(indent + 2));
  }
  if (!Array.isArray(value) && !isMap(value)) return ` ${scalar(value)}\n`;
  if (Array.isArray(value)) {
    if (value.length === 0) return " []\n";
    return "\n" + emitList(value, indent + 2);
  }
  if (value.__map.length === 0) return " {}\n";
  return "\n" + emitMap(value, indent + 2);
}

function emitList(list: YNode[], indent: number): string {
  const pad = " ".repeat(indent);
  let out = "";
  for (const item of list) {
    if (isMap(item)) {
      // First entry on the dash line, the rest aligned under it.
      const inner = emitMap(item, indent + 2);
      out += `${pad}- ${inner.slice(indent + 2)}`;
    } else if (Array.isArray(item)) {
      throw new Error("nested lists are not supported");
    } else {
      out += `${pad}- ${scalar(item)}\n`;
    }
  }
  return out;
}

export function toYaml(root: YMap): string {
  // Blank line between top-level keys and between services for readability.
  const pad = "";
  let out = "";
  root.__map.forEach(({ key, value, comment }, i) => {
    if (i > 0) out += "\n";
    out += emitComment(comment, pad);
    if (isMap(value) && (key === "services" || key === "configs")) {
      out += `${key}:\n`;
      value.__map.forEach((svc, j) => {
        if (j > 0) out += "\n";
        out += emitComment(svc.comment, "  ");
        out += `  ${svc.key}:${emitValue(svc.value, 2)}`;
      });
    } else {
      out += `${key}:${emitValue(value, 0)}`;
    }
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* Option normalization                                                */
/* ------------------------------------------------------------------ */

export function normalizeRelativePath(p: string): string {
  let s = (p || "/").trim();
  if (!s.startsWith("/")) s = "/" + s;
  s = s.replace(/\/+$/, "");
  return s === "" ? "/" : s;
}

export function normalizeHostname(h: string): string {
  return (h || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

/** Applies the constraints between options so every output is coherent. */
export function normalizeOptions(
  input: Partial<ComposeOptions>,
): ComposeOptions {
  const o: ComposeOptions = { ...DEFAULT_OPTIONS, ...input };
  if (o.database === "dev-file" && o.mode === "prod") o.database = "postgres";
  if (o.database === "cockroach" && o.image !== "phasetwo")
    o.database = "postgres";
  o.version = (o.version || "").trim() || VERSIONS[o.image][0];
  o.relativePath = normalizeRelativePath(o.relativePath);
  o.hostname = normalizeHostname(o.hostname) || DEFAULT_OPTIONS.hostname;
  o.acmeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((o.acmeEmail || "").trim())
    ? o.acmeEmail.trim()
    : "";
  if (o.proxyCert !== "selfsigned") o.proxyCert = "letsencrypt";
  o.httpPort =
    Number.isInteger(o.httpPort) && o.httpPort > 0 && o.httpPort < 65536
      ? o.httpPort
      : 8080;
  o.themeName = (o.themeName || "").trim().replace(/[^A-Za-z0-9._-]/g, "");
  o.memoryLimit = (o.memoryLimit || "").trim();
  o.heapOpts = (o.heapOpts || "").trim();
  return o;
}

/* ------------------------------------------------------------------ */
/* Generation                                                          */
/* ------------------------------------------------------------------ */

function pathJoin(base: string, p: string): string {
  return (base === "/" ? "" : base) + p;
}

/**
 * A Docker healthcheck against Keycloak's management port. Neither image
 * ships curl, so it uses bash's /dev/tcp. Every `$` is escaped as `$$` so
 * Compose does not try to interpolate it.
 */
function keycloakHealthcheck(relativePath: string, startPeriod: string): YMap {
  const path = pathJoin(relativePath, "/health/ready");
  const script =
    "exec 3<>/dev/tcp/127.0.0.1/9000 && " +
    `printf 'GET ${path} HTTP/1.1\\r\\nHost: localhost\\r\\nConnection: close\\r\\n\\r\\n' >&3 && ` +
    "grep -q 'HTTP/1.1 200' <&3";
  return ymap(
    e("test", ["CMD", "bash", "-c", script]),
    e("interval", "10s"),
    e("timeout", "5s"),
    e("retries", 30),
    e("start_period", startPeriod),
  );
}

interface DbSpec {
  service: YMap;
  volume: string;
  kcEnv: YEntry[];
  envVars: [string, string][];
}

function dbSpec(o: ComposeOptions, s: Secrets): DbSpec | null {
  switch (o.database) {
    case "postgres":
      return {
        volume: "postgres_data",
        service: ymap(
          e("image", DB_IMAGES.postgres),
          e("restart", "unless-stopped"),
          e(
            "environment",
            ymap(
              e("POSTGRES_DB", "keycloak"),
              e("POSTGRES_USER", "keycloak"),
              e("POSTGRES_PASSWORD", "${DB_PASSWORD}"),
            ),
          ),
          e("volumes", ["postgres_data:/var/lib/postgresql/data"]),
          e(
            "healthcheck",
            ymap(
              e("test", ["CMD-SHELL", "pg_isready -U keycloak -d keycloak"]),
              e("interval", "5s"),
              e("timeout", "5s"),
              e("retries", 20),
            ),
          ),
        ),
        kcEnv: [
          e("KC_DB", "postgres"),
          e("KC_DB_URL_HOST", "db"),
          e("KC_DB_URL_PORT", 5432),
          e("KC_DB_URL_DATABASE", "keycloak"),
          e("KC_DB_USERNAME", "keycloak"),
          e("KC_DB_PASSWORD", "${DB_PASSWORD}"),
        ],
        envVars: [["DB_PASSWORD", s.dbPassword]],
      };
    case "mysql":
    case "mariadb": {
      const maria = o.database === "mariadb";
      const P = maria ? "MARIADB" : "MYSQL";
      return {
        volume: maria ? "mariadb_data" : "mysql_data",
        service: ymap(
          e("image", maria ? DB_IMAGES.mariadb : DB_IMAGES.mysql),
          e("restart", "unless-stopped"),
          e(
            "environment",
            ymap(
              e(`${P}_DATABASE`, "keycloak"),
              e(`${P}_USER`, "keycloak"),
              e(`${P}_PASSWORD`, "${DB_PASSWORD}"),
              e(`${P}_ROOT_PASSWORD`, "${DB_ROOT_PASSWORD}"),
            ),
          ),
          e("volumes", [
            `${maria ? "mariadb_data" : "mysql_data"}:/var/lib/mysql`,
          ]),
          e(
            "healthcheck",
            ymap(
              e(
                "test",
                maria
                  ? [
                      "CMD",
                      "healthcheck.sh",
                      "--connect",
                      "--innodb_initialized",
                    ]
                  : [
                      "CMD-SHELL",
                      "mysqladmin ping -h 127.0.0.1 -u keycloak -p$$MYSQL_PASSWORD --silent",
                    ],
              ),
              e("interval", "5s"),
              e("timeout", "5s"),
              e("retries", 30),
              e("start_period", "20s"),
            ),
          ),
        ),
        kcEnv: [
          e("KC_DB", o.database),
          e("KC_DB_URL_HOST", "db"),
          e("KC_DB_URL_PORT", 3306),
          e("KC_DB_URL_DATABASE", "keycloak"),
          e("KC_DB_USERNAME", "keycloak"),
          e("KC_DB_PASSWORD", "${DB_PASSWORD}"),
        ],
        envVars: [
          ["DB_PASSWORD", s.dbPassword],
          ["DB_ROOT_PASSWORD", s.dbRootPassword],
        ],
      };
    }
    case "cockroach":
      return {
        volume: "cockroach_data",
        service: ymap(
          e("image", DB_IMAGES.cockroach),
          e("restart", "unless-stopped"),
          e(
            "command",
            ["start-single-node", "--insecure"],
            "Single node, no TLS: for local development and testing only.",
          ),
          e("environment", ymap(e("COCKROACH_DATABASE", "keycloak"))),
          e("volumes", ["cockroach_data:/cockroach/cockroach-data"]),
          e(
            "healthcheck",
            ymap(
              e("test", [
                "CMD",
                "cockroach",
                "sql",
                "--insecure",
                "--host=localhost",
                "--database=keycloak",
                "-e",
                "SELECT 1",
              ]),
              e("interval", "5s"),
              e("timeout", "5s"),
              e("retries", 30),
              e("start_period", "10s"),
            ),
          ),
        ),
        kcEnv: [
          e("KC_DB", "cockroach"),
          e("KC_DB_URL_HOST", "db"),
          e("KC_DB_URL_PORT", 26257),
          e("KC_DB_URL_DATABASE", "keycloak"),
          e(
            "KC_DB_URL_PROPERTIES",
            "?sslmode=disable&useCockroachMetadata=true",
            "useCockroachMetadata=true is required for CockroachDB.",
          ),
          e("KC_DB_SCHEMA", "public"),
          e("KC_DB_USERNAME", "root"),
        ],
        envVars: [],
      };
    case "dev-file":
      return null;
  }
}

function caddyfile(host: string, cert: ProxyCert, email: string): string {
  const global =
    cert === "letsencrypt" && email ? `{\n  email ${email}\n}\n\n` : "";
  const tls = cert === "selfsigned" ? "  tls internal\n" : "";
  return `${global}${host} {\n${tls}  reverse_proxy keycloak:8080\n}\n`;
}

/** Traefik dynamic configuration, loaded with the file provider. */
function traefikDynamic(host: string, cert: ProxyCert): string {
  return [
    "http:",
    "  routers:",
    "    keycloak:",
    `      rule: "Host(\`${host}\`)"`,
    "      entryPoints:",
    "        - websecure",
    "      service: keycloak",
    cert === "letsencrypt"
      ? "      tls:\n        certResolver: letsencrypt"
      : "      tls: {}",
    "  services:",
    "    keycloak:",
    "      loadBalancer:",
    "        servers:",
    '          - url: "http://keycloak:8080"',
    "",
  ].join("\n");
}

function traefikCommand(cert: ProxyCert, email: string): string[] {
  const cmd = [
    "--entrypoints.web.address=:80",
    "--entrypoints.web.http.redirections.entrypoint.to=websecure",
    "--entrypoints.web.http.redirections.entrypoint.scheme=https",
    "--entrypoints.websecure.address=:443",
    "--providers.file.filename=/etc/traefik/dynamic.yml",
  ];
  if (cert === "letsencrypt") {
    cmd.push(
      "--certificatesresolvers.letsencrypt.acme.httpchallenge=true",
      "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web",
      "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json",
    );
    if (email)
      cmd.push(`--certificatesresolvers.letsencrypt.acme.email=${email}`);
  }
  return cmd;
}

function nginxConf(host: string): string {
  // `$$` is how Compose spells a literal `$` inside config content.
  return [
    "events {}",
    "http {",
    "  server {",
    "    listen 80;",
    `    server_name ${host};`,
    "    return 301 https://$$host$$request_uri;",
    "  }",
    "  server {",
    "    listen 443 ssl;",
    `    server_name ${host};`,
    "    ssl_certificate     /etc/nginx/certs/tls.crt;",
    "    ssl_certificate_key /etc/nginx/certs/tls.key;",
    "    # Keycloak sends large headers (cookies, tokens).",
    "    proxy_buffer_size       128k;",
    "    proxy_buffers           4 256k;",
    "    proxy_busy_buffers_size 256k;",
    "    location / {",
    "      proxy_pass http://keycloak:8080;",
    "      proxy_set_header Host              $$host;",
    "      proxy_set_header X-Forwarded-For   $$proxy_add_x_forwarded_for;",
    "      proxy_set_header X-Forwarded-Proto $$scheme;",
    "      proxy_set_header X-Forwarded-Host  $$host;",
    "      proxy_set_header X-Forwarded-Port  $$server_port;",
    "    }",
    "  }",
    "}",
    "",
  ].join("\n");
}

const ROLLING_TAGS = /^(latest|nightly|\d+|\d+\.\d+)$/;

/**
 * Phase Two rebuilds every Keycloak patch line as extensions update, so only
 * `<keycloak-version>.<build-timestamp>` is immutable. Upstream's
 * `MAJOR.MINOR.PATCH` tags keep the same Keycloak version.
 */
export function isRollingTag(image: ImageKind, tag: string): boolean {
  if (image === "phasetwo") return !/^\d+\.\d+\.\d+\.\d+$/.test(tag);
  return ROLLING_TAGS.test(tag);
}

export function generate(
  input: Partial<ComposeOptions>,
  secrets: Secrets,
): GeneratedFiles {
  const o = normalizeOptions(input);
  const p2 = o.image === "phasetwo";
  const prod = o.mode === "prod";
  const imageRef = `${p2 ? PHASETWO_IMAGE : UPSTREAM_IMAGE}:${o.version}`;
  const db = dbSpec(o, secrets);
  const behindProxy = o.exposure === "proxy";
  const directTls = o.exposure === "tls";
  const adminPassword = o.defaultAdminPassword
    ? "admin"
    : secrets.adminPassword;
  const base = o.relativePath === "/" ? "" : o.relativePath;

  const warnings: Warning[] = [];
  const explanation: string[] = [];
  const prerequisites: string[] = [];

  /* ----- Keycloak command ----- */
  const command: string[] = [prod ? "start" : "start-dev"];
  if (o.realmImport) command.push("--import-realm");
  if (p2) command.push(...PHASETWO_SPI_FLAGS);

  /* ----- Keycloak environment ----- */
  const env: YEntry[] = [
    e("KC_BOOTSTRAP_ADMIN_USERNAME", "${KC_BOOTSTRAP_ADMIN_USERNAME}"),
    e("KC_BOOTSTRAP_ADMIN_PASSWORD", "${KC_BOOTSTRAP_ADMIN_PASSWORD}"),
  ];
  if (db) env.push(...db.kcEnv);
  if (o.relativePath !== "/")
    env.push(e("KC_HTTP_RELATIVE_PATH", o.relativePath));

  if (directTls) {
    env.push(
      e("KC_HTTPS_CERTIFICATE_FILE", "/opt/keycloak/conf/certs/tls.crt"),
      e("KC_HTTPS_CERTIFICATE_KEY_FILE", "/opt/keycloak/conf/certs/tls.key"),
      e("KC_HTTP_ENABLED", "false"),
    );
  } else {
    env.push(
      e(
        "KC_HTTP_ENABLED",
        "true",
        behindProxy
          ? "TLS terminates at the proxy; Keycloak speaks HTTP on the internal network."
          : undefined,
      ),
    );
  }
  if (behindProxy) {
    env.push(e("KC_PROXY_HEADERS", "xforwarded"));
  }
  if (behindProxy || directTls) {
    env.push(e("KC_HOSTNAME", o.hostname));
  } else if (prod) {
    env.push(e("KC_HOSTNAME", "localhost"));
  }
  env.push(
    e("KC_HEALTH_ENABLED", o.healthMetrics ? "true" : "false"),
    e("KC_METRICS_ENABLED", o.healthMetrics ? "true" : "false"),
  );
  if (o.healthMetrics && directTls) {
    env.push(
      e(
        "KC_HTTP_MANAGEMENT_SCHEME",
        "http",
        "Plain HTTP on the management port so the healthcheck works without TLS.",
      ),
    );
  }
  if (o.heapOpts) env.push(e("JAVA_OPTS_KC_HEAP", o.heapOpts));

  /* ----- Keycloak ports and volumes ----- */
  const ports: string[] = [];
  if (directTls) ports.push("8443:8443");
  else if (!behindProxy) ports.push(`${o.httpPort}:8080`);
  if (o.healthMetrics) ports.push("127.0.0.1:9000:9000");

  const kcVolumes: string[] = [];
  if (directTls) {
    kcVolumes.push("./certs:/opt/keycloak/conf/certs:ro");
    prerequisites.push(
      `./certs/tls.crt and ./certs/tls.key, the certificate and private key for ${o.hostname}, readable by uid ${p2 ? 2000 : 1000}`,
    );
  }
  if (o.realmImport) {
    kcVolumes.push("./realms:/opt/keycloak/data/import:ro");
    prerequisites.push(
      "./realms/, containing one or more realm export files (*.json)",
    );
  }
  if (o.themeName) {
    kcVolumes.push(
      `./themes/${o.themeName}:/opt/keycloak/themes/${o.themeName}:ro`,
    );
    prerequisites.push(
      `./themes/${o.themeName}/, a theme directory (for example login/theme.properties)`,
    );
  }

  /* ----- Keycloak service ----- */
  const kcDepends: YEntry[] = [];
  if (db) kcDepends.push(e("db", ymap(e("condition", "service_healthy"))));
  if (o.mailpit)
    kcDepends.push(e("mailpit", ymap(e("condition", "service_started"))));

  const keycloak = ymap(
    e("image", imageRef),
    e("restart", "unless-stopped"),
    e("command", command),
    e("environment", ymap(...env)),
    ports.length ? e("ports", ports) : null,
    kcVolumes.length ? e("volumes", kcVolumes) : null,
    kcDepends.length ? e("depends_on", ymap(...kcDepends)) : null,
    o.healthMetrics
      ? e(
          "healthcheck",
          keycloakHealthcheck(
            o.relativePath,
            o.database === "cockroach" ? "10m" : prod ? "90s" : "30s",
          ),
          o.database === "cockroach"
            ? "Creating the schema on CockroachDB takes several minutes on the first start."
            : undefined,
        )
      : null,
    o.memoryLimit
      ? e(
          "mem_limit",
          o.memoryLimit,
          o.heapOpts
            ? undefined
            : "The JVM sizes its heap to 70% of this limit by default.",
        )
      : null,
  );

  /* ----- Services ----- */
  const services: YEntry[] = [];
  const volumes: YEntry[] = [];
  const configs: YEntry[] = [];

  if (db) {
    services.push(e("db", db.service));
    volumes.push(e(db.volume, ymap()));
  }
  services.push(e("keycloak", keycloak));

  if (behindProxy) {
    const proxyDepends = ymap(
      e(
        "keycloak",
        ymap(
          e(
            "condition",
            o.healthMetrics ? "service_healthy" : "service_started",
          ),
        ),
      ),
    );
    const le = o.proxyCert === "letsencrypt";
    if (o.proxy === "caddy") {
      configs.push(
        e(
          "caddyfile",
          ymap(e("content", caddyfile(o.hostname, o.proxyCert, o.acmeEmail))),
        ),
      );
      services.push(
        e(
          "proxy",
          ymap(
            e("image", CADDY_IMAGE),
            e("restart", "unless-stopped"),
            e("ports", ["80:80", "443:443", "443:443/udp"]),
            e("configs", [
              ymap(
                e("source", "caddyfile"),
                e("target", "/etc/caddy/Caddyfile"),
              ),
            ]),
            e("volumes", ["caddy_data:/data", "caddy_config:/config"]),
            e("depends_on", proxyDepends),
          ),
          le
            ? "Caddy obtains and renews a Let's Encrypt certificate for the hostname automatically."
            : "Caddy issues a certificate from its own local CA (tls internal).",
        ),
      );
      volumes.push(e("caddy_data", ymap()), e("caddy_config", ymap()));
    } else if (o.proxy === "traefik") {
      configs.push(
        e(
          "traefik_dynamic",
          ymap(e("content", traefikDynamic(o.hostname, o.proxyCert))),
        ),
      );
      services.push(
        e(
          "proxy",
          ymap(
            e("image", TRAEFIK_IMAGE),
            e("restart", "unless-stopped"),
            e("command", traefikCommand(o.proxyCert, o.acmeEmail)),
            e("ports", ["80:80", "443:443"]),
            e("configs", [
              ymap(
                e("source", "traefik_dynamic"),
                e("target", "/etc/traefik/dynamic.yml"),
              ),
            ]),
            le ? e("volumes", ["traefik_letsencrypt:/letsencrypt"]) : null,
            e("depends_on", proxyDepends),
          ),
          le
            ? "Traefik obtains and renews a Let's Encrypt certificate over the HTTP-01 challenge."
            : "Traefik serves its built-in self-signed certificate.\nRouting comes from a file, so the Docker socket is not mounted.",
        ),
      );
      if (le) volumes.push(e("traefik_letsencrypt", ymap()));
    } else {
      configs.push(e("nginx_conf", ymap(e("content", nginxConf(o.hostname)))));
      services.push(
        e(
          "proxy",
          ymap(
            e("image", NGINX_IMAGE),
            e("restart", "unless-stopped"),
            e("ports", ["80:80", "443:443"]),
            e("configs", [
              ymap(
                e("source", "nginx_conf"),
                e("target", "/etc/nginx/nginx.conf"),
              ),
            ]),
            e("volumes", ["./certs:/etc/nginx/certs:ro"]),
            e("depends_on", proxyDepends),
          ),
        ),
      );
      prerequisites.push(
        `./certs/tls.crt and ./certs/tls.key, the certificate and private key for ${o.hostname}`,
      );
    }
  }

  if (o.mailpit) {
    services.push(
      e(
        "mailpit",
        ymap(
          e("image", MAILPIT_IMAGE),
          e("restart", "unless-stopped"),
          e("ports", ["127.0.0.1:8025:8025"]),
        ),
        "Catches every email Keycloak sends. Set the realm SMTP host to mailpit, port 1025.",
      ),
    );
  }

  const header = [
    `Keycloak ${prod ? "production" : "development"} stack.`,
    "Generated with phasetwo.io/tools/keycloak-docker-compose-generator",
    "Secrets are read from the .env file next to this one.",
  ].join("\n");

  const root = ymap(
    e("name", "keycloak", header),
    e("services", ymap(...services)),
    volumes.length ? e("volumes", ymap(...volumes)) : null,
    configs.length
      ? e(
          "configs",
          ymap(...configs),
          "Inline configs require Docker Compose 2.23.1 or newer.",
        )
      : null,
  );
  const compose = toYaml(root);

  /* ----- .env ----- */
  const envLines = [
    "# Secrets for docker-compose.yml. Generated in your browser — keep this file private.",
    `KC_BOOTSTRAP_ADMIN_USERNAME=admin`,
    `KC_BOOTSTRAP_ADMIN_PASSWORD=${adminPassword}`,
  ];
  if (db) for (const [k, v] of db.envVars) envLines.push(`${k}=${v}`);
  const envFile = envLines.join("\n") + "\n";

  /* ----- URL and run command ----- */
  let url: string;
  if (behindProxy || directTls) {
    url = `https://${o.hostname}${directTls ? ":8443" : ""}${base}/`;
  } else {
    url = `http://localhost:${o.httpPort}${base}/`;
  }
  const runCommand = "docker compose up -d\ndocker compose logs -f keycloak";

  /* ----- Explanation ----- */
  explanation.push(
    p2
      ? `Runs the Phase Two Keycloak image (${imageRef}): upstream Keycloak plus the Phase Two extensions.`
      : `Runs the official Keycloak image (${imageRef}).`,
  );
  explanation.push(
    prod
      ? "Starts Keycloak with `start` (production mode): strict hostname, caching, and security defaults. The first start builds the server configuration for the chosen database, which takes a little longer."
      : "Starts Keycloak with `start-dev` (development mode): relaxed hostname checks and no theme caching. Not for production.",
  );
  if (db) {
    const names = {
      postgres: "PostgreSQL",
      mysql: "MySQL",
      mariadb: "MariaDB",
      cockroach: "CockroachDB (single node, insecure)",
    } as const;
    explanation.push(
      `Stores data in ${names[o.database as keyof typeof names]} on the named volume \`${db.volume}\`. Keycloak waits for the database healthcheck to pass before starting.`,
    );
    if (o.database === "cockroach") {
      explanation.push(
        "The first start against CockroachDB creates the Keycloak schema, which takes several minutes. Later starts are fast.",
      );
    }
  } else {
    explanation.push(
      "Stores data in the embedded H2 file database inside the container. It is lost when the container is removed.",
    );
  }
  if (behindProxy) {
    explanation.push(
      o.proxy === "nginx"
        ? `Puts nginx in front on ports 80 and 443, terminating TLS with the certificate in ./certs and redirecting HTTP to HTTPS.`
        : `Puts ${o.proxy === "caddy" ? "Caddy" : "Traefik"} in front on ports 80 and 443, redirecting HTTP to HTTPS. ${
            o.proxyCert === "letsencrypt"
              ? `It gets a Let's Encrypt certificate for ${o.hostname} automatically, so the hostname's DNS must point at this machine and port 80 must be reachable from the internet.`
              : o.proxy === "caddy"
                ? "It signs a certificate with its own local CA, which browsers do not trust by default."
                : "It serves Traefik's built-in self-signed certificate, which browsers do not trust."
          }`,
    );
    explanation.push(
      "Keycloak is not published on the host. It trusts the proxy's X-Forwarded-* headers (`KC_PROXY_HEADERS=xforwarded`), so only the proxy must be able to reach it.",
    );
  } else if (directTls) {
    explanation.push(
      `Serves HTTPS directly from Keycloak on port 8443 with the certificate mounted from ./certs. Plain HTTP is off.`,
    );
  } else {
    explanation.push(`Publishes Keycloak on http://localhost:${o.httpPort}.`);
  }
  if (o.relativePath !== "/") {
    explanation.push(
      `Serves Keycloak under \`${o.relativePath}\`, as Phase Two clusters do, for example ${url}realms/master/.`,
    );
  }
  if (o.healthMetrics) {
    explanation.push(
      `Enables health checks and Prometheus metrics on the management port 9000, bound to 127.0.0.1 only (${pathJoin(o.relativePath, "/health/ready")}, ${pathJoin(o.relativePath, "/metrics")}). Docker uses the readiness check to mark the container healthy.`,
    );
  }
  if (o.realmImport) {
    explanation.push(
      "Imports every realm file in ./realms on startup (`--import-realm`). Realms that already exist are skipped, not overwritten.",
    );
  }
  if (o.themeName) {
    explanation.push(
      `Mounts ./themes/${o.themeName} as the \`${o.themeName}\` theme. Select it under Realm settings → Themes.`,
    );
  }
  if (o.mailpit) {
    explanation.push(
      "Adds Mailpit to catch outgoing email. Open http://localhost:8025 to read it, and set the realm SMTP server to host `mailpit`, port `1025`.",
    );
  }
  if (o.memoryLimit || o.heapOpts) {
    explanation.push(
      o.heapOpts
        ? `Sets the JVM heap explicitly with JAVA_OPTS_KC_HEAP (${o.heapOpts})${o.memoryLimit ? ` inside a ${o.memoryLimit} container limit` : ""}.`
        : `Limits the container to ${o.memoryLimit}; Keycloak sizes its heap to 70% of that.`,
    );
  }
  explanation.push(
    "Reads the admin and database passwords from .env, so the compose file is safe to commit and the .env file is not.",
  );

  /* ----- Warnings ----- */
  if (o.defaultAdminPassword) {
    warnings.push(
      prod
        ? {
            level: "danger",
            message:
              "Production mode with the admin/admin bootstrap password. Anyone who reaches the admin console can take over the server. Use the generated password.",
          }
        : {
            level: "warning",
            message:
              "The bootstrap admin password is admin. Fine on your laptop, but never expose this instance.",
          },
    );
  }
  if (prod && o.exposure === "localhost") {
    warnings.push({
      level: "danger",
      message:
        "Production mode over plain HTTP. Tokens, passwords, and session cookies travel unencrypted. Put a TLS proxy in front or serve TLS directly.",
    });
  }
  if (o.database === "cockroach" && prod) {
    warnings.push({
      level: "warning",
      message:
        "The CockroachDB service is a single insecure node. For production, use a secured multi-node cluster or CockroachDB Cloud and set sslmode=verify-full.",
    });
  }
  if (prod && isRollingTag(o.image, o.version)) {
    warnings.push({
      level: "warning",
      message: p2
        ? `The tag ${o.version} moves whenever a new build is published, so a restart can change the Keycloak or extension versions under you. Pin a full <keycloak-version>.<build-timestamp> tag for production.`
        : `The tag ${o.version} moves when new Keycloak versions are published, so a restart can upgrade Keycloak under you. Pin a full version for production.`,
    });
  }
  if (
    (behindProxy || directTls) &&
    /(^|\.)example\.(com|org|net)$/.test(o.hostname)
  ) {
    warnings.push({
      level: "warning",
      message: `${o.hostname} is a placeholder. Replace it with the real public hostname before you start the stack.`,
    });
  }
  const autoCert = behindProxy && o.proxy !== "nginx";
  const isLocalHost =
    /^(localhost|127\.0\.0\.1)$|\.(localhost|local|test|internal)$/.test(
      o.hostname,
    );
  if (autoCert && o.proxyCert === "selfsigned") {
    warnings.push(
      prod
        ? {
            level: "warning",
            message:
              "A self-signed certificate in production: browsers and OIDC clients will reject it unless you distribute and trust the CA. Use Let's Encrypt or your own certificate for real users.",
          }
        : {
            level: "info",
            message:
              "The proxy uses a self-signed certificate, so browsers will warn until you trust it.",
          },
    );
  }
  if (autoCert && o.proxyCert === "letsencrypt" && isLocalHost) {
    warnings.push(
      o.proxy === "caddy"
        ? {
            level: "info",
            message: `Let's Encrypt cannot issue for ${o.hostname}, so Caddy falls back to its own local CA. Browsers will warn until you trust it.`,
          }
        : {
            level: "warning",
            message: `Let's Encrypt cannot issue for ${o.hostname}. Traefik will serve its self-signed default certificate instead; choose self-signed to make that explicit.`,
          },
    );
  }
  if (!o.healthMetrics) {
    warnings.push({
      level: "info",
      message:
        "Health checks are off, so Docker cannot tell when Keycloak is ready and dependents start as soon as the container does.",
    });
  }
  if (!prod && (behindProxy || directTls)) {
    warnings.push({
      level: "info",
      message:
        "Development mode behind TLS is handy for testing redirects and cookies, but switch to production mode before real users arrive.",
    });
  }
  if (o.mailpit && prod) {
    warnings.push({
      level: "info",
      message:
        "Mailpit swallows every email. Point the realm at a real SMTP provider before users need password resets or verification links.",
    });
  }

  return {
    compose,
    env: envFile,
    warnings,
    explanation,
    prerequisites,
    runCommand,
    url,
    options: o,
  };
}
