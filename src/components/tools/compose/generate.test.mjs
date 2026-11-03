import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

import {
  generate,
  normalizeOptions,
  randomPassword,
  generateSecrets,
  DEFAULT_OPTIONS,
  PHASETWO_SPI_FLAGS,
} from "./generate.ts";

// js-yaml is not a direct dependency; resolve the copy Docusaurus already ships.
const require = createRequire(import.meta.url);
const coreRequire = createRequire(
  require.resolve("@docusaurus/core/package.json"),
);
const utilsRequire = createRequire(
  coreRequire.resolve("@docusaurus/utils/package.json"),
);
const yaml = utilsRequire("js-yaml");

const SECRETS = {
  adminPassword: "AdminPass123",
  dbPassword: "DbPass456",
  dbRootPassword: "RootPass789",
};

function build(opts) {
  const out = generate(opts, SECRETS);
  const doc = yaml.load(out.compose);
  return { out, doc, kc: doc.services.keycloak };
}

/** Every combination of the main switches. */
function* allCombos() {
  for (const image of ["phasetwo", "upstream"])
    for (const mode of ["dev", "prod"])
      for (const database of [
        "postgres",
        "mysql",
        "mariadb",
        "cockroach",
        "dev-file",
      ])
        for (const exposure of ["localhost", "proxy", "tls"])
          for (const proxy of ["caddy", "nginx"])
            for (const healthMetrics of [true, false])
              yield {
                image,
                mode,
                database,
                exposure,
                proxy,
                healthMetrics,
                mailpit: true,
                realmImport: true,
                themeName: "acme",
                memoryLimit: "2g",
              };
}

test("every combination produces YAML that parses and is internally consistent", () => {
  let n = 0;
  for (const opts of allCombos()) {
    const { out, doc, kc } = build(opts);
    n++;
    assert.ok(kc, "keycloak service exists");
    assert.equal(doc.name, "keycloak");
    // Every depends_on target is a defined service.
    for (const [name, svc] of Object.entries(doc.services)) {
      for (const dep of Object.keys(svc.depends_on || {})) {
        assert.ok(
          doc.services[dep],
          `${name} depends on missing service ${dep}`,
        );
        if (svc.depends_on[dep].condition === "service_healthy") {
          assert.ok(
            doc.services[dep].healthcheck,
            `${dep} needs a healthcheck`,
          );
        }
      }
      // Every named volume is declared at the top level.
      for (const v of svc.volumes || []) {
        const src = v.split(":")[0];
        if (!src.startsWith(".") && !src.startsWith("/")) {
          assert.ok(
            doc.volumes && src in doc.volumes,
            `volume ${src} declared`,
          );
        }
      }
      for (const c of svc.configs || []) {
        assert.ok(doc.configs[c.source], `config ${c.source} declared`);
      }
    }
    // Secrets referenced in compose are all defined in .env.
    const refs = [...out.compose.matchAll(/\$\{([A-Z_]+)\}/g)].map((m) => m[1]);
    for (const r of refs) {
      assert.match(out.env, new RegExp(`^${r}=`, "m"), `${r} defined in .env`);
    }
    // Real passwords never appear in the compose file.
    assert.ok(!out.compose.includes(SECRETS.dbPassword));
    assert.ok(!out.compose.includes(SECRETS.adminPassword));
  }
  assert.equal(n, 2 * 2 * 5 * 3 * 2 * 2);
});

test("default: Phase Two image, start-dev, Postgres, localhost", () => {
  const { out, doc, kc } = build(DEFAULT_OPTIONS);
  assert.equal(kc.image, "quay.io/phasetwo/phasetwo-keycloak:26.8.1");
  assert.deepEqual(kc.command, ["start-dev", ...PHASETWO_SPI_FLAGS]);
  assert.equal(kc.environment.KC_DB, "postgres");
  assert.equal(kc.environment.KC_DB_URL_HOST, "db");
  assert.equal(kc.environment.KC_DB_PASSWORD, "${DB_PASSWORD}");
  assert.equal(kc.environment.KC_HTTP_ENABLED, "true");
  assert.equal(kc.environment.KC_HTTP_RELATIVE_PATH, "/auth");
  assert.deepEqual(kc.depends_on, { db: { condition: "service_healthy" } });
  assert.deepEqual(kc.ports, ["8080:8080", "127.0.0.1:9000:9000"]);
  assert.equal(doc.services.db.image, "postgres:17-alpine");
  assert.ok(doc.volumes.postgres_data !== undefined);
  assert.match(
    kc.healthcheck.test[3],
    /GET \/auth\/health\/ready HTTP\/1\.1\\r\\n/,
  );
  assert.equal(out.url, "http://localhost:8080/auth/");
  assert.match(out.env, /^KC_BOOTSTRAP_ADMIN_PASSWORD=AdminPass123$/m);
  assert.match(out.env, /^DB_PASSWORD=DbPass456$/m);
  assert.deepEqual(out.warnings, []);
});

test("upstream image omits the Phase Two SPI flags", () => {
  const { kc } = build({ image: "upstream", relativePath: "/" });
  assert.equal(kc.image, "quay.io/keycloak/keycloak:26.8.1");
  assert.deepEqual(kc.command, ["start-dev"]);
  assert.equal(kc.environment.KC_HTTP_RELATIVE_PATH, undefined);
  assert.match(kc.healthcheck.test[3], /GET \/health\/ready /);
});

test("dev-file H2 is dev only and has no db service", () => {
  const dev = build({ database: "dev-file" });
  assert.equal(dev.doc.services.db, undefined);
  assert.equal(dev.kc.environment.KC_DB, undefined);
  assert.equal(dev.kc.depends_on, undefined);
  const prod = build({ database: "dev-file", mode: "prod" });
  assert.equal(prod.out.options.database, "postgres");
  assert.ok(prod.doc.services.db);
});

test("CockroachDB requires the Phase Two image and useCockroachMetadata", () => {
  const { kc, doc } = build({ database: "cockroach" });
  assert.equal(kc.environment.KC_DB, "cockroach");
  assert.match(
    kc.environment.KC_DB_URL_PROPERTIES,
    /useCockroachMetadata=true/,
  );
  assert.deepEqual(doc.services.db.command, [
    "start-single-node",
    "--insecure",
  ]);
  const up = build({ database: "cockroach", image: "upstream" });
  assert.equal(up.kc.environment.KC_DB, "postgres");
});

test("MySQL and MariaDB use their own env names and healthchecks", () => {
  const my = build({ database: "mysql" });
  assert.equal(my.kc.environment.KC_DB, "mysql");
  assert.equal(my.doc.services.db.environment.MYSQL_PASSWORD, "${DB_PASSWORD}");
  assert.match(
    my.doc.services.db.healthcheck.test[1],
    /mysqladmin ping .*\$\$MYSQL_PASSWORD/,
  );
  assert.match(my.out.env, /^DB_ROOT_PASSWORD=RootPass789$/m);
  const ma = build({ database: "mariadb" });
  assert.equal(ma.kc.environment.KC_DB, "mariadb");
  assert.equal(
    ma.doc.services.db.environment.MARIADB_ROOT_PASSWORD,
    "${DB_ROOT_PASSWORD}",
  );
  assert.deepEqual(ma.doc.services.db.healthcheck.test.slice(0, 2), [
    "CMD",
    "healthcheck.sh",
  ]);
});

test("production behind Caddy", () => {
  const { out, doc, kc } = build({
    mode: "prod",
    exposure: "proxy",
    proxy: "caddy",
    hostname: "https://sso.acme.test/",
  });
  assert.equal(kc.command[0], "start");
  assert.equal(kc.environment.KC_HOSTNAME, "sso.acme.test");
  assert.equal(kc.environment.KC_PROXY_HEADERS, "xforwarded");
  assert.equal(kc.environment.KC_HTTP_ENABLED, "true");
  assert.deepEqual(kc.ports, ["127.0.0.1:9000:9000"], "keycloak not published");
  assert.equal(doc.services.proxy.image, "caddy:2-alpine");
  assert.deepEqual(doc.services.proxy.depends_on, {
    keycloak: { condition: "service_healthy" },
  });
  assert.equal(
    doc.configs.caddyfile.content,
    "sso.acme.test {\n  reverse_proxy keycloak:8080\n}\n",
  );
  assert.equal(out.url, "https://sso.acme.test/auth/");
  // Rolling tag in prod warns.
  assert.ok(out.warnings.some((w) => /Pin a full/.test(w.message)));
  assert.ok(!out.warnings.some((w) => w.level === "danger"));
});

test("nginx config escapes $ for Compose and mounts certs", () => {
  const { doc, out } = build({
    mode: "prod",
    exposure: "proxy",
    proxy: "nginx",
    hostname: "sso.acme.test",
  });
  const conf = doc.configs.nginx_conf.content;
  assert.match(conf, /proxy_set_header X-Forwarded-Proto \$\$scheme;/);
  assert.ok(!/[^$]\$[a-z]/.test(conf), "no unescaped $ in nginx config");
  assert.deepEqual(doc.services.proxy.volumes, ["./certs:/etc/nginx/certs:ro"]);
  assert.ok(out.prerequisites.some((p) => p.includes("./certs/tls.crt")));
});

test("direct TLS mounts certs and serves the management port over HTTP", () => {
  const { kc, out } = build({
    mode: "prod",
    exposure: "tls",
    hostname: "sso.acme.test",
  });
  assert.equal(kc.environment.KC_HTTP_ENABLED, "false");
  assert.equal(
    kc.environment.KC_HTTPS_CERTIFICATE_FILE,
    "/opt/keycloak/conf/certs/tls.crt",
  );
  assert.equal(kc.environment.KC_HTTP_MANAGEMENT_SCHEME, "http");
  assert.ok(kc.volumes.includes("./certs:/opt/keycloak/conf/certs:ro"));
  assert.ok(kc.ports.includes("8443:8443"));
  assert.equal(out.url, "https://sso.acme.test:8443/auth/");
});

test("extras: mailpit, realm import, theme, memory", () => {
  const { kc, doc, out } = build({
    mailpit: true,
    realmImport: true,
    themeName: "my theme!",
    memoryLimit: "2g",
    heapOpts: "-Xms512m -Xmx1g",
  });
  assert.ok(kc.command.includes("--import-realm"));
  assert.ok(kc.volumes.includes("./realms:/opt/keycloak/data/import:ro"));
  assert.ok(
    kc.volumes.includes("./themes/mytheme:/opt/keycloak/themes/mytheme:ro"),
  );
  assert.equal(kc.mem_limit, "2g");
  assert.equal(kc.environment.JAVA_OPTS_KC_HEAP, "-Xms512m -Xmx1g");
  assert.equal(doc.services.mailpit.image.split(":")[0], "axllent/mailpit");
  assert.equal(kc.depends_on.mailpit.condition, "service_started");
  assert.equal(out.prerequisites.length, 2);
});

test("health and metrics off removes the healthcheck and management port", () => {
  const { kc, doc } = build({ healthMetrics: false, exposure: "proxy" });
  assert.equal(kc.healthcheck, undefined);
  assert.equal(kc.environment.KC_HEALTH_ENABLED, "false");
  assert.equal(kc.ports, undefined);
  assert.equal(
    doc.services.proxy.depends_on.keycloak.condition,
    "service_started",
  );
});

test("insecure combinations raise warnings", () => {
  const w = (opts) => generate(opts, SECRETS).warnings;
  assert.ok(
    w({
      mode: "prod",
      defaultAdminPassword: true,
      exposure: "proxy",
      hostname: "a.b.test",
    }).some((x) => x.level === "danger" && /admin\/admin/.test(x.message)),
  );
  assert.ok(
    w({ mode: "prod" }).some(
      (x) => x.level === "danger" && /plain HTTP/.test(x.message),
    ),
  );
  assert.ok(
    w({ defaultAdminPassword: true }).some((x) => x.level === "warning"),
  );
  assert.ok(
    w({ mode: "prod", exposure: "proxy", hostname: "auth.example.com" }).some(
      (x) => /placeholder/.test(x.message),
    ),
  );
  assert.ok(
    w({ mode: "prod", database: "cockroach", exposure: "proxy" }).some((x) =>
      /single insecure node/.test(x.message),
    ),
  );
  assert.ok(
    !w({
      mode: "prod",
      version: "26.8.1.1793384608",
      exposure: "proxy",
      hostname: "a.b.test",
    }).some((x) => /Pin a full/.test(x.message)),
  );
});

test("default admin password goes into .env", () => {
  const out = generate({ defaultAdminPassword: true }, SECRETS);
  assert.match(out.env, /^KC_BOOTSTRAP_ADMIN_PASSWORD=admin$/m);
});

test("normalizeOptions cleans up inputs", () => {
  const o = normalizeOptions({
    relativePath: "auth/",
    hostname: "HTTPS://Foo.Test/x",
    httpPort: 0,
    version: " ",
  });
  assert.equal(o.relativePath, "/auth");
  assert.equal(o.hostname, "foo.test");
  assert.equal(o.httpPort, 8080);
  assert.equal(o.version, "26.8.1");
  assert.equal(normalizeOptions({ relativePath: "/" }).relativePath, "/");
});

test("randomPassword is alphanumeric, the right length, and unbiased-ish", () => {
  for (let i = 0; i < 50; i++) {
    const p = randomPassword(24);
    assert.equal(p.length, 24);
    assert.match(p, /^[A-Za-z0-9]+$/);
  }
  const s = generateSecrets();
  assert.notEqual(s.adminPassword, s.dbPassword);
  // Deterministic with an injected source; bytes >= the rejection limit are skipped.
  let i = 0;
  const fixed = (n) =>
    Uint8Array.from({ length: n }, () => [255, 0, 1][i++ % 3]);
  assert.equal(randomPassword(4, fixed), "ABAB");
});
