import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "../Icon";
import { parseJwt } from "../jwt/decode";
import {
  checkDiscovery,
  fetchDiscovery,
  issuerFromInput,
  FriendlyFetchError,
  type DiscoveryDocument,
  type DiscoveryWarning,
} from "./discovery";
import { challengeS256, generateCodeVerifier, randomToken } from "./pkce";
import { buildAuthorizeUrl, buildLogoutUrl, type BuiltParam } from "./params";
import { lintCallback, parseOidcUrl, type Finding } from "./lint";
import { errorFromBody, explainError, type ErrorExplanation } from "./errors";
import {
  checkIdTokenClaims,
  exchangeCode,
  fetchUserinfo,
  refreshTokens,
  type CheckResult,
  type EndpointResult,
  type TokenResponse,
} from "./tokens";
import {
  clearState,
  loadState,
  updateState,
  type PendingFlow,
  type PlaygroundConfig,
} from "./storage";
import {
  Button,
  Card,
  CopyButton,
  ErrorExplanationCard,
  FindingList,
  JsonBlock,
  ParamTable,
  PrivacyBanner,
  SectionLabel,
  StatusRow,
  TextInput,
  TokenCard,
} from "./ui";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const DEFAULT_SCOPE = "openid profile email";

const EXTRA_PARAMS: {
  name: string;
  label: string;
  placeholder: string;
  hint: string;
}[] = [
  {
    name: "login_hint",
    label: "login_hint",
    placeholder: "alice@example.com",
    hint: "Prefills the username field on the login page.",
  },
  {
    name: "kc_idp_hint",
    label: "kc_idp_hint (Keycloak)",
    placeholder: "google",
    hint: "Skip the login page and go straight to this identity provider. Use the alias from Identity providers; an unknown alias is ignored.",
  },
  {
    name: "acr_values",
    label: "acr_values",
    placeholder: "gold",
    hint: "Request an authentication level. In Keycloak, map ACR values to levels of authentication (ACR to LoA Mapping in realm settings or the client's Advanced tab) and use a step-up browser flow. The result is in the acr claim.",
  },
  {
    name: "ui_locales",
    label: "ui_locales",
    placeholder: "de en",
    hint: "Preferred login page languages. Keycloak only honors these when Internationalization is on (Realm settings → Localization) and the locale is supported.",
  },
  {
    name: "max_age",
    label: "max_age",
    placeholder: "300",
    hint: "Force re-authentication if the last login is older than this many seconds.",
  },
];

const PROMPT_OPTIONS = [
  "",
  "login",
  "consent",
  "select_account",
  "none",
  "create",
];

/** The redirect URI is this page, normalized to the site's trailing-slash form. */
function currentRedirectUri(): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname.replace(/\/?$/, "/")}`;
}

type Problem = {
  message: string;
  hint?: string;
  explanation?: ErrorExplanation;
  description?: string;
};

function toProblem(e: unknown): Problem {
  if (e instanceof FriendlyFetchError)
    return { message: e.message, hint: e.hint };
  return { message: e instanceof Error ? e.message : String(e) };
}

/** Turn a non-2xx OAuth endpoint response into a Problem. */
function problemFromResponse(res: EndpointResult, what: string): Problem {
  const err = errorFromBody(res.response.body);
  return {
    message: `The ${what} returned HTTP ${res.response.status}${err?.error ? ` (${err.error})` : ""}.`,
    explanation: err ? explainError(err.error, err.description) : undefined,
    description: err?.description,
  };
}

/* ------------------------------------------------------------------ */
/* Layout pieces                                                       */
/* ------------------------------------------------------------------ */

function Step({
  n,
  title,
  done,
  children,
  aside,
}: {
  n: number;
  title: string;
  done?: boolean;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 flex items-center gap-2.5 text-lg font-semibold text-white">
          <span
            className={`flex size-7 items-center justify-center rounded-full text-sm ${
              done
                ? "bg-green-400/15 text-green-300"
                : "bg-p2blue-500/15 text-p2blue-300"
            }`}
          >
            {done ? <Icon icon="mdi:check" className="size-4" /> : n}
          </span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function ProblemBox({ problem }: { problem: Problem }) {
  return (
    <div className="flex flex-col gap-2">
      <StatusRow severity="error">{problem.message}</StatusRow>
      {problem.hint && (
        <div className="pl-5 text-sm text-gray-400">{problem.hint}</div>
      )}
      {problem.explanation && (
        <ErrorExplanationCard
          ex={problem.explanation}
          description={problem.description}
        />
      )}
    </div>
  );
}

function RequestView({ result }: { result: EndpointResult }) {
  const { request, response } = result;
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div>
        <div className="mb-1 text-xs text-gray-500">Request</div>
        <JsonBlock
          value={
            `${request.method} ${request.url}\n` +
            Object.entries(request.headers)
              .map(
                ([k, v]) =>
                  `${k}: ${k === "Authorization" ? `${v.slice(0, 20)}…` : v}`,
              )
              .join("\n") +
            (request.body
              ? `\n\n${new URLSearchParams(request.body).toString().replace(/&/g, "\n&")}`
              : "")
          }
        />
      </div>
      <div>
        <div className="mb-1 text-xs text-gray-500">
          Response · HTTP {response.status}
        </div>
        <JsonBlock value={response.body} />
      </div>
    </div>
  );
}

function CheckList({ checks }: { checks: CheckResult[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {checks.map((c) => (
        <StatusRow
          key={c.name}
          severity={
            c.status === "pass" ? "ok" : c.status === "fail" ? "error" : "info"
          }
        >
          <code className="mr-1.5 text-xs text-white">{c.name}</code>
          <span className="text-gray-300">{c.message}</span>
        </StatusRow>
      ))}
    </div>
  );
}

function KeycloakSetup({
  redirectUri,
  origin,
}: {
  redirectUri: string;
  origin: string;
}) {
  return (
    <div className="rounded-xl border border-p2blue-500/20 bg-p2blue-500/[0.06] p-4 text-sm text-gray-300">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-p2blue-300">
        <Icon icon="mdi:cog-outline" className="size-4" />
        Configure your Keycloak client
      </div>
      <p className="mb-2">
        In the admin console (Keycloak 26), open your realm →{" "}
        <strong className="text-white">Clients</strong> →{" "}
        <strong className="text-white">Create client</strong>, choose{" "}
        <strong className="text-white">OpenID Connect</strong>, and give it a
        Client ID. Then:
      </p>
      <div className="mb-1 text-xs font-semibold text-gray-200">
        Capability config
      </div>
      <ul className="mb-2 list-disc space-y-1 pl-5">
        <li>
          <strong className="text-white">Client authentication: Off</strong> —
          this makes it a public client. Browser apps cannot keep a secret.
        </li>
        <li>
          <strong className="text-white">Standard flow</strong> checked (the
          authorization code flow). Implicit flow and Direct access grants can
          stay unchecked.
        </li>
        <li>
          <strong className="text-white">Require PKCE: On</strong>, with{" "}
          <strong className="text-white">PKCE Method: S256</strong> — Keycloak
          then rejects requests without a valid challenge. (Older Keycloak
          versions have this under Advanced → Proof Key for Code Exchange Code
          Challenge Method.)
        </li>
      </ul>
      <div className="mb-1 text-xs font-semibold text-gray-200">
        Login settings
      </div>
      <ul className="mb-2 list-disc space-y-1 pl-5">
        <li>
          <strong className="text-white">Valid redirect URIs</strong>:{" "}
          <code className="break-all">{redirectUri}</code> — matched exactly,
          including the trailing slash.
        </li>
        <li>
          <strong className="text-white">
            Valid post logout redirect URIs
          </strong>
          : the same URI, or <code>+</code> to reuse the redirect URIs (needed
          for the logout step).
        </li>
        <li>
          <strong className="text-white">Web origins</strong>:{" "}
          <code className="break-all">{origin}</code> (or <code>+</code>) — so
          the browser may call the token and userinfo endpoints (CORS).
        </li>
      </ul>
      <p className="mb-0 text-xs text-gray-400">
        Use a test client in a non-production realm. Remove this site&apos;s
        URIs from the client when you are done.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

type Prepared = {
  state: string;
  nonce: string;
  verifier: string;
  challenge: string;
};

type CallbackInfo = {
  findings: Finding[];
  error?: ErrorExplanation & { description?: string; uri?: string };
  kind: "login" | "logout" | "unexpected";
};

export default function OidcPlayground() {
  // Browser-only values are filled in after mount so SSR renders cleanly.
  const [redirectUri, setRedirectUri] = useState("");
  const [origin, setOrigin] = useState("");
  const [storageOk, setStorageOk] = useState(true);

  const [issuer, setIssuer] = useState("");
  const [clientId, setClientId] = useState("");
  const [scope, setScope] = useState(DEFAULT_SCOPE);
  const [prompt, setPrompt] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [showExtra, setShowExtra] = useState(false);

  const [discovery, setDiscovery] = useState<DiscoveryDocument | undefined>();
  const [discoveryWarnings, setDiscoveryWarnings] = useState<
    DiscoveryWarning[]
  >([]);
  const [discoveryProblem, setDiscoveryProblem] = useState<
    Problem | undefined
  >();
  const [discoveryLoading, setDiscoveryLoading] = useState(false);

  const [prepared, setPrepared] = useState<Prepared | undefined>();
  const [authUrl, setAuthUrl] = useState<
    { url: string; params: BuiltParam[] } | undefined
  >();

  const [callback, setCallback] = useState<CallbackInfo | undefined>();
  const [flowContext, setFlowContext] = useState<
    { nonce?: string; issuer: string } | undefined
  >();
  const [exchange, setExchange] = useState<EndpointResult | undefined>();
  const [exchangeProblem, setExchangeProblem] = useState<Problem | undefined>();
  const [busy, setBusy] = useState<string | undefined>();

  const [tokens, setTokens] = useState<TokenResponse | undefined>();
  const [tokenSource, setTokenSource] = useState<"code" | "refresh">("code");
  const [idChecks, setIdChecks] = useState<CheckResult[] | undefined>();

  const [userinfo, setUserinfo] = useState<EndpointResult | undefined>();
  const [userinfoProblem, setUserinfoProblem] = useState<Problem | undefined>();
  const [refresh, setRefresh] = useState<EndpointResult | undefined>();
  const [refreshProblem, setRefreshProblem] = useState<Problem | undefined>();

  const handledCallback = useRef(false);

  const config: PlaygroundConfig = useMemo(
    () => ({ issuer, clientId, scope, extra: { ...extra, prompt } }),
    [issuer, clientId, scope, extra, prompt],
  );

  const loadDiscovery = useCallback(
    async (iss: string): Promise<DiscoveryDocument | undefined> => {
      setDiscoveryLoading(true);
      setDiscoveryProblem(undefined);
      try {
        const doc = await fetchDiscovery(iss);
        setDiscovery(doc);
        setDiscoveryWarnings(checkDiscovery(doc, iss));
        return doc;
      } catch (e) {
        setDiscovery(undefined);
        setDiscoveryWarnings([]);
        setDiscoveryProblem(toProblem(e));
        return undefined;
      } finally {
        setDiscoveryLoading(false);
      }
    },
    [],
  );

  /** Apply a token response and run ID token checks. */
  const applyTokens = useCallback(
    async (
      t: TokenResponse,
      source: "code" | "refresh",
      doc: DiscoveryDocument,
      cid: string,
      expectedNonce: string | undefined,
    ) => {
      setTokens(t);
      setTokenSource(source);
      if (t.id_token) {
        const parsed = parseJwt(t.id_token);
        setIdChecks(
          await checkIdTokenClaims({
            header: parsed.header.json,
            payload: parsed.payload.json,
            expectedIssuer: doc.issuer,
            clientId: cid,
            expectedNonce: source === "code" ? expectedNonce : undefined,
            accessToken: t.access_token,
            now: Date.now(),
          }),
        );
      } else {
        setIdChecks(undefined);
      }
    },
    [],
  );

  /* ---------------- mount: restore config + handle the redirect back ---------------- */
  useEffect(() => {
    const ru = currentRedirectUri();
    setRedirectUri(ru);
    setOrigin(window.location.origin);
    setStorageOk(updateState({}));

    const stored = loadState();
    if (stored.config) {
      setIssuer(stored.config.issuer);
      setClientId(stored.config.clientId);
      setScope(stored.config.scope || DEFAULT_SCOPE);
      const { prompt: p = "", ...rest } = stored.config.extra ?? {};
      setPrompt(p);
      setExtra(rest);
      if (Object.values(rest).some(Boolean)) setShowExtra(true);
    }

    const href = window.location.href;
    const parsed = parseOidcUrl(href);
    const names = new Set(parsed.params.map((p) => p.name));
    const pending: PendingFlow | undefined = stored.pending;
    const isLoginReturn = names.has("code") || names.has("error");
    const isLogoutReturn =
      !isLoginReturn && names.has("state") && pending?.kind === "logout";
    if (!isLoginReturn && !isLogoutReturn) {
      if (stored.config?.issuer) void loadDiscovery(stored.config.issuer);
      return;
    }
    if (handledCallback.current) return;
    handledCallback.current = true;

    // Remove code/state from the address bar (and history) right away.
    window.history.replaceState(null, "", window.location.pathname);
    // The pending flow is single-use.
    updateState({ pending: undefined });

    if (isLogoutReturn && pending) {
      const lint = lintCallback(parsed, { expectedState: pending.state });
      setCallback({ kind: "logout", findings: lint.findings });
      if (stored.config?.issuer) void loadDiscovery(stored.config.issuer);
      return;
    }

    if (!pending || pending.kind !== "login") {
      const lint = lintCallback(parsed);
      setCallback({
        kind: "unexpected",
        error: lint.error,
        findings: [
          {
            severity: "error",
            message:
              "Got a callback, but there is no pending login in this tab's session storage — the tab may have changed, storage may be blocked, or the flow was cleared. Start again.",
          },
          ...lint.findings,
        ],
      });
      return;
    }

    const lint = lintCallback(parsed, {
      expectedState: pending.state,
      expectedIssuer: pending.issuer,
    });
    setCallback({ kind: "login", findings: lint.findings, error: lint.error });
    setFlowContext({ nonce: pending.nonce, issuer: pending.issuer });

    const code = parsed.params.find((p) => p.name === "code")?.value;
    const state = parsed.params.find((p) => p.name === "state")?.value;
    const issMismatch = lint.findings.some(
      (f) => f.param === "iss" && f.severity === "error",
    );
    if (
      !code ||
      state !== pending.state ||
      issMismatch ||
      !pending.codeVerifier
    ) {
      if (stored.config?.issuer) void loadDiscovery(stored.config.issuer);
      return;
    }

    const cid = stored.config?.clientId ?? "";
    void (async () => {
      const doc = await loadDiscovery(pending.issuer);
      if (!doc?.token_endpoint) return;
      setBusy("exchange");
      try {
        const res = await exchangeCode({
          tokenEndpoint: doc.token_endpoint,
          clientId: cid,
          code,
          redirectUri: pending.redirectUri,
          codeVerifier: pending.codeVerifier!,
        });
        setExchange(res);
        if (res.response.ok) {
          await applyTokens(
            res.response.body as TokenResponse,
            "code",
            doc,
            cid,
            pending.nonce,
          );
        } else {
          setExchangeProblem(problemFromResponse(res, "token endpoint"));
        }
      } catch (e) {
        setExchangeProblem(toProblem(e));
      } finally {
        setBusy(undefined);
      }
    })();
  }, [loadDiscovery, applyTokens]);

  /* ---------------- persist config as it changes ---------------- */
  useEffect(() => {
    if (!redirectUri) return; // not mounted yet
    updateState({ config });
  }, [config, redirectUri]);

  /* ---------------- PKCE / state / nonce for the next login ---------------- */
  const regenerate = useCallback(async () => {
    const verifier = generateCodeVerifier(64);
    setPrepared({
      state: randomToken(32),
      nonce: randomToken(32),
      verifier,
      challenge: await challengeS256(verifier),
    });
  }, []);

  useEffect(() => {
    if (redirectUri) void regenerate();
  }, [redirectUri, regenerate]);

  useEffect(() => {
    if (
      !discovery?.authorization_endpoint ||
      !clientId.trim() ||
      !prepared ||
      !redirectUri
    ) {
      setAuthUrl(undefined);
      return;
    }
    try {
      setAuthUrl(
        buildAuthorizeUrl({
          authorizationEndpoint: discovery.authorization_endpoint,
          clientId: clientId.trim(),
          redirectUri,
          scope,
          state: prepared.state,
          nonce: prepared.nonce,
          codeChallenge: prepared.challenge,
          extra: { ...extra, prompt },
        }),
      );
    } catch {
      setAuthUrl(undefined);
    }
  }, [discovery, clientId, prepared, redirectUri, scope, extra, prompt]);

  /* ---------------- actions ---------------- */
  const startLogin = () => {
    if (!authUrl || !prepared || !discovery) return;
    const ok = updateState({
      config,
      pending: {
        kind: "login",
        state: prepared.state,
        nonce: prepared.nonce,
        codeVerifier: prepared.verifier,
        redirectUri,
        issuer: discovery.issuer,
        createdAt: Date.now(),
      },
    });
    if (!ok) {
      setStorageOk(false);
      return;
    }
    window.location.assign(authUrl.url);
  };

  const callUserinfo = async () => {
    if (!discovery?.userinfo_endpoint || !tokens?.access_token) return;
    setBusy("userinfo");
    setUserinfoProblem(undefined);
    try {
      const res = await fetchUserinfo({
        userinfoEndpoint: discovery.userinfo_endpoint,
        accessToken: tokens.access_token,
      });
      setUserinfo(res);
      if (!res.response.ok)
        setUserinfoProblem(problemFromResponse(res, "userinfo endpoint"));
    } catch (e) {
      setUserinfo(undefined);
      setUserinfoProblem(toProblem(e));
    } finally {
      setBusy(undefined);
    }
  };

  const doRefresh = async () => {
    if (!discovery?.token_endpoint || !tokens?.refresh_token) return;
    setBusy("refresh");
    setRefreshProblem(undefined);
    try {
      const res = await refreshTokens({
        tokenEndpoint: discovery.token_endpoint,
        clientId: clientId.trim(),
        refreshToken: tokens.refresh_token,
      });
      setRefresh(res);
      if (res.response.ok) {
        const next = res.response.body as TokenResponse;
        // Keep the previous refresh token if the server did not rotate it.
        await applyTokens(
          {
            ...next,
            refresh_token: next.refresh_token ?? tokens.refresh_token,
          },
          "refresh",
          discovery,
          clientId.trim(),
          undefined,
        );
        setUserinfo(undefined);
      } else {
        setRefreshProblem(problemFromResponse(res, "token endpoint"));
      }
    } catch (e) {
      setRefreshProblem(toProblem(e));
    } finally {
      setBusy(undefined);
    }
  };

  const logoutUrl = useMemo(() => {
    if (
      !discovery?.end_session_endpoint ||
      !redirectUri ||
      !clientId.trim() ||
      !prepared
    )
      return undefined;
    return buildLogoutUrl({
      endSessionEndpoint: discovery.end_session_endpoint,
      idTokenHint: tokens?.id_token,
      clientId: clientId.trim(),
      postLogoutRedirectUri: redirectUri,
      state: prepared.state,
    });
  }, [discovery, redirectUri, clientId, tokens, prepared]);

  const startLogout = () => {
    if (!logoutUrl || !prepared || !discovery) return;
    const ok = updateState({
      config,
      pending: {
        kind: "logout",
        state: prepared.state,
        redirectUri,
        issuer: discovery.issuer,
        createdAt: Date.now(),
      },
    });
    if (!ok) {
      setStorageOk(false);
      return;
    }
    window.location.assign(logoutUrl);
  };

  const resetAll = () => {
    clearState();
    setIssuer("");
    setClientId("");
    setScope(DEFAULT_SCOPE);
    setPrompt("");
    setExtra({});
    setDiscovery(undefined);
    setDiscoveryWarnings([]);
    setDiscoveryProblem(undefined);
    setCallback(undefined);
    setFlowContext(undefined);
    setExchange(undefined);
    setExchangeProblem(undefined);
    setTokens(undefined);
    setIdChecks(undefined);
    setUserinfo(undefined);
    setUserinfoProblem(undefined);
    setRefresh(undefined);
    setRefreshProblem(undefined);
    void regenerate();
  };

  const issuerChanged =
    discovery && issuerFromInput(issuer) !== issuerFromInput(discovery.issuer);

  /* ---------------- render ---------------- */
  return (
    <div className="not-prose mx-auto flex max-w-5xl flex-col gap-5">
      <PrivacyBanner>
        Runs entirely in your browser as a public client. Requests go only to
        the issuer you enter and the endpoints it advertises. Tokens stay in
        memory; only the in-flight state, nonce, and PKCE verifier are kept in
        this tab&apos;s session storage.
      </PrivacyBanner>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-400">
          Flow: authorization code + PKCE (S256), public client.
        </div>
        <Button variant="secondary" onClick={resetAll}>
          <Icon icon="mdi:broom" className="size-4" />
          Clear everything
        </Button>
      </div>

      {!storageOk && (
        <StatusRow severity="error">
          Session storage is unavailable (private mode or blocked site data?).
          The playground needs it to keep the PKCE verifier and state across the
          redirect.
        </StatusRow>
      )}

      {/* ------------- Return from the authorization server ------------- */}
      {callback && (
        <Step
          n={0}
          title={
            callback.kind === "logout"
              ? "Back from logout"
              : callback.kind === "login"
                ? "Back from the authorization server"
                : "Unexpected callback"
          }
          done={!callback.findings.some((f) => f.severity === "error")}
        >
          {callback.kind === "logout" &&
            !callback.findings.some((f) => f.severity === "error") && (
              <p className="mb-3 text-sm text-gray-300">
                The server ended the session and redirected back to{" "}
                <code>post_logout_redirect_uri</code>. Your tokens are
                discarded.
              </p>
            )}
          <FindingList findings={callback.findings} />
          {callback.error && (
            <div className="mt-3">
              <ErrorExplanationCard
                ex={callback.error}
                description={callback.error.description}
                uri={callback.error.uri}
              />
            </div>
          )}
        </Step>
      )}

      {/* ------------- Step 1: issuer ------------- */}
      <Step
        n={1}
        title="Issuer and discovery"
        done={!!discovery && !issuerChanged}
      >
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (issuer.trim()) void loadDiscovery(issuer);
          }}
        >
          <div className="flex-1">
            <TextInput
              id="pg-issuer"
              label="Issuer URL"
              value={issuer}
              onChange={setIssuer}
              placeholder="https://your-host/realms/your-realm"
              hint="For Keycloak: https://<host>/realms/<realm>. You can also paste the full /.well-known/openid-configuration URL."
            />
          </div>
          <div className="sm:mb-5">
            <Button type="submit" disabled={!issuer.trim() || discoveryLoading}>
              {discoveryLoading ? "Fetching…" : "Fetch discovery"}
            </Button>
          </div>
        </form>
        {discoveryProblem && (
          <div className="mt-3">
            <ProblemBox problem={discoveryProblem} />
          </div>
        )}
        {discovery && (
          <div className="mt-4 flex flex-col gap-3">
            {issuerChanged && (
              <StatusRow severity="warning">
                The issuer field changed since discovery was fetched — fetch
                again.
              </StatusRow>
            )}
            {discoveryWarnings.map((w) => (
              <StatusRow key={w.message} severity={w.severity}>
                {w.message}
              </StatusRow>
            ))}
            <ParamTable
              rows={(
                [
                  ["issuer", discovery.issuer],
                  ["authorization_endpoint", discovery.authorization_endpoint],
                  ["token_endpoint", discovery.token_endpoint],
                  ["userinfo_endpoint", discovery.userinfo_endpoint],
                  ["jwks_uri", discovery.jwks_uri],
                  ["end_session_endpoint", discovery.end_session_endpoint],
                  [
                    "code_challenge_methods_supported",
                    discovery.code_challenge_methods_supported?.join(", "),
                  ],
                ] as [string, string | undefined][]
              ).map(([name, value]) => ({
                name,
                value: value ?? "(not advertised)",
                info: { desc: "" },
              }))}
            />
            <details>
              <summary className="cursor-pointer text-xs text-gray-400">
                Full discovery document
              </summary>
              <div className="mt-2">
                <JsonBlock value={discovery} />
              </div>
            </details>
          </div>
        )}
      </Step>

      {/* ------------- Step 2: client ------------- */}
      <Step n={2} title="Client" done={!!clientId.trim()}>
        <div className="mb-4">
          <SectionLabel>Redirect URI (this page)</SectionLabel>
          <div className="flex items-center gap-2 rounded-lg border border-p2blue-500/30 bg-black/30 px-3 py-2">
            <code className="min-w-0 flex-1 break-all border-0 bg-transparent p-0 text-sm text-white">
              {redirectUri || "…"}
            </code>
            {redirectUri && (
              <CopyButton
                value={redirectUri}
                label="redirect URI"
                text="Copy"
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <TextInput
              id="pg-client-id"
              label="client_id"
              value={clientId}
              onChange={setClientId}
              placeholder="my-spa"
            />
            <TextInput
              id="pg-scope"
              label="scope"
              value={scope}
              onChange={setScope}
              hint="Space-separated. Keep openid to get an ID token."
            />
            <div>
              <label
                htmlFor="pg-prompt"
                className="mb-1 block text-xs font-medium text-gray-300"
              >
                prompt
              </label>
              <select
                id="pg-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none focus:border-p2blue-500/60"
              >
                {PROMPT_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p || "(not set)"}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowExtra((s) => !s)}
              className="flex items-center gap-1 self-start text-xs text-p2blue-400 hover:underline"
            >
              <Icon
                icon={showExtra ? "mdi:chevron-up" : "mdi:chevron-down"}
                className="size-4"
              />
              More optional parameters
            </button>
            {showExtra &&
              EXTRA_PARAMS.map((p) => (
                <TextInput
                  key={p.name}
                  id={`pg-${p.name}`}
                  label={p.label}
                  value={extra[p.name] ?? ""}
                  onChange={(v) => setExtra((x) => ({ ...x, [p.name]: v }))}
                  placeholder={p.placeholder}
                  hint={p.hint}
                />
              ))}
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-gray-400">
              <strong className="text-gray-200">
                No client secret field — on purpose.
              </strong>{" "}
              Anything shipped to a browser can be read by whoever runs it, so a
              browser app cannot hold a secret. Browser apps are public clients
              and prove possession with PKCE instead. Test confidential clients
              from a backend.
            </div>
          </div>
          <KeycloakSetup
            redirectUri={redirectUri || "https://…"}
            origin={origin || "https://…"}
          />
        </div>
      </Step>

      {/* ------------- Step 3: authorize URL ------------- */}
      <Step
        n={3}
        title="Authorization request"
        aside={
          prepared && (
            <Button variant="secondary" onClick={() => void regenerate()}>
              <Icon icon="mdi:refresh" className="size-4" />
              New state, nonce &amp; verifier
            </Button>
          )
        }
      >
        {!authUrl ? (
          <div className="text-sm text-gray-500">
            Fetch discovery and enter a client_id to build the URL.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <SectionLabel>Authorize URL</SectionLabel>
              <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <code className="min-w-0 flex-1 break-all border-0 bg-transparent p-0 text-xs text-gray-200">
                  {authUrl.url}
                </code>
                <CopyButton value={authUrl.url} label="authorize URL" />
              </div>
            </div>
            <ParamTable rows={authUrl.params} />
            {prepared && (
              <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-gray-400">
                <div className="mb-1">
                  <strong className="text-gray-200">code_verifier</strong> (kept
                  in session storage, sent only to the token endpoint):{" "}
                  <code className="break-all">{prepared.verifier}</code>
                </div>
                <div>
                  code_challenge = BASE64URL(SHA-256(code_verifier)). The server
                  stores the challenge and later checks that the verifier hashes
                  to it.
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={startLogin} disabled={!storageOk}>
                <Icon icon="mdi:login" className="size-4" />
                Log in
              </Button>
              <span className="text-xs text-gray-500">
                You will leave this page and come back to the redirect URI
                above.
              </span>
            </div>
          </div>
        )}
      </Step>

      {/* ------------- Step 4: token exchange ------------- */}
      <Step n={4} title="Token exchange" done={!!exchange?.response.ok}>
        {!exchange && !exchangeProblem && busy !== "exchange" && (
          <div className="text-sm text-gray-500">
            After you log in and return, the code is exchanged here
            automatically: a POST to the token endpoint with{" "}
            <code>grant_type=authorization_code</code>, the code, the redirect
            URI, and the PKCE <code>code_verifier</code> — no secret.
          </div>
        )}
        {busy === "exchange" && (
          <StatusRow severity="info">Exchanging the code…</StatusRow>
        )}
        {exchangeProblem && (
          <div className="mb-3">
            <ProblemBox problem={exchangeProblem} />
          </div>
        )}
        {exchange && <RequestView result={exchange} />}
      </Step>

      {/* ------------- Step 5: tokens ------------- */}
      <Step n={5} title="Tokens" done={!!tokens}>
        {!tokens ? (
          <div className="text-sm text-gray-500">
            Decoded tokens appear here after the exchange.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tokenSource === "refresh" && (
              <StatusRow severity="info">
                Showing tokens from the latest refresh.
              </StatusRow>
            )}
            {tokens.id_token && (
              <TokenCard
                label="ID token"
                token={tokens.id_token}
                jwksUri={discovery?.jwks_uri}
                note={
                  idChecks && (
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        ID token validation
                      </div>
                      <CheckList checks={idChecks} />
                      {tokenSource === "refresh" && (
                        <div className="mt-2 text-xs text-gray-500">
                          The nonce is only checked on the token response to the
                          original login.
                        </div>
                      )}
                    </div>
                  )
                }
              />
            )}
            {tokens.access_token && (
              <TokenCard
                label="Access token"
                token={tokens.access_token}
                jwksUri={discovery?.jwks_uri}
                note={
                  <div className="text-xs text-gray-500">
                    Access tokens are meant for APIs (resource servers), not for
                    the client to read. Keycloak issues them as JWTs, so they
                    decode here.
                  </div>
                }
              />
            )}
            {tokens.refresh_token && (
              <TokenCard
                label="Refresh token"
                token={tokens.refresh_token}
                jwksUri={discovery?.jwks_uri}
              />
            )}
            <details>
              <summary className="cursor-pointer text-xs text-gray-400">
                Raw token response
              </summary>
              <div className="mt-2">
                <JsonBlock value={tokens} />
              </div>
            </details>
          </div>
        )}
      </Step>

      {/* ------------- Step 6: userinfo / refresh / logout ------------- */}
      <Step n={6} title="Userinfo, refresh, and logout">
        <div className="mb-4 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={callUserinfo}
            disabled={
              !tokens?.access_token || !discovery?.userinfo_endpoint || !!busy
            }
          >
            <Icon icon="mdi:account-details-outline" className="size-4" />
            {busy === "userinfo" ? "Calling…" : "Call userinfo"}
          </Button>
          <Button
            variant="secondary"
            onClick={doRefresh}
            disabled={
              !tokens?.refresh_token || !discovery?.token_endpoint || !!busy
            }
          >
            <Icon icon="mdi:refresh" className="size-4" />
            {busy === "refresh" ? "Refreshing…" : "Refresh tokens"}
          </Button>
          <Button
            variant="danger"
            onClick={startLogout}
            disabled={!logoutUrl || !tokens}
          >
            <Icon icon="mdi:logout" className="size-4" />
            Log out (RP-initiated)
          </Button>
        </div>
        {!tokens && (
          <div className="text-sm text-gray-500">
            Available once you have tokens.
          </div>
        )}
        {tokens && !discovery?.end_session_endpoint && (
          <div className="mb-3 text-sm text-gray-500">
            The issuer does not advertise an end_session_endpoint.
          </div>
        )}
        {logoutUrl && tokens && (
          <div className="mb-4">
            <SectionLabel>Logout URL</SectionLabel>
            <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <code className="min-w-0 flex-1 break-all border-0 bg-transparent p-0 text-xs text-gray-200">
                {logoutUrl}
              </code>
              <CopyButton value={logoutUrl} label="logout URL" />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              <code>post_logout_redirect_uri</code> must be allowed by the
              client&apos;s Valid post logout redirect URIs;{" "}
              <code>id_token_hint</code> tells the server which session to end.
            </div>
          </div>
        )}
        {userinfoProblem && (
          <div className="mb-3">
            <ProblemBox problem={userinfoProblem} />
          </div>
        )}
        {userinfo && (
          <div className="mb-4">
            <SectionLabel>Userinfo</SectionLabel>
            <RequestView result={userinfo} />
          </div>
        )}
        {refreshProblem && (
          <div className="mb-3">
            <ProblemBox problem={refreshProblem} />
          </div>
        )}
        {refresh && (
          <div>
            <SectionLabel>Refresh</SectionLabel>
            <RequestView result={refresh} />
          </div>
        )}
        {flowContext && (
          <div className="mt-3 text-xs text-gray-600">
            Flow started against {flowContext.issuer}.
          </div>
        )}
      </Step>
    </div>
  );
}
