import { useEffect, useMemo, useState } from "react";
import {
  parseOidcUrl,
  lintAuthorize,
  lintCallback,
  type Finding,
} from "./lint";
import { explainError } from "./errors";
import {
  fetchDiscovery,
  guessKeycloakIssuer,
  FriendlyFetchError,
  type DiscoveryDocument,
} from "./discovery";
import {
  Button,
  Card,
  ErrorExplanationCard,
  FindingList,
  ParamTable,
  PrivacyBanner,
  SectionLabel,
  StatusRow,
  TextInput,
} from "./ui";

const SAMPLES: { label: string; url: string }[] = [
  {
    label: "Good authorize URL",
    url: "https://auth.example.com/realms/demo/protocol/openid-connect/auth?response_type=code&client_id=my-spa&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&scope=openid%20profile%20email&state=Zr1qJm3x9KcV8pL2nT6wQy4sB7dF0hGa&nonce=Xc8vN2mK5pQ9rT3wY6zA1bD4fG7hJ0kL&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256",
  },
  {
    label: "Implicit flow",
    url: "https://auth.example.com/realms/demo/protocol/openid-connect/auth?response_type=id_token%20token&client_id=legacy-app&redirect_uri=http%3A%2F%2Fapp.example.com%2F*&scope=profile&state=abc",
  },
  {
    label: "Error callback",
    url: "https://app.example.com/callback?error=login_required&error_description=Login+required&state=Zr1qJm3x9KcV8pL2nT6wQy4sB7dF0hGa&iss=https%3A%2F%2Fauth.example.com%2Frealms%2Fdemo",
  },
  {
    label: "Keycloak error page",
    url: "Invalid parameter: redirect_uri",
  },
];

export default function UrlInspector() {
  const [input, setInput] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuerTouched, setIssuerTouched] = useState(false);
  const [discovery, setDiscovery] = useState<DiscoveryDocument | undefined>();
  const [discoveryError, setDiscoveryError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const parsed = useMemo(() => parseOidcUrl(input), [input]);
  const hasInput = input.trim().length > 0;

  // A bare Keycloak error message pasted from its error page (no URL params).
  const pastedErrorText =
    hasInput && parsed.params.length === 0
      ? explainError(undefined, input)
      : undefined;

  const authorize = useMemo(
    () =>
      parsed.kind === "authorize"
        ? lintAuthorize(parsed, discovery)
        : undefined,
    [parsed, discovery],
  );
  const callback = useMemo(
    () => (parsed.kind === "callback" ? lintCallback(parsed) : undefined),
    [parsed],
  );

  // Suggest the issuer from a Keycloak-shaped endpoint or iss param.
  useEffect(() => {
    if (issuerTouched) return;
    const iss =
      parsed.params.find((p) => p.name === "iss")?.value ??
      (parsed.base ? guessKeycloakIssuer(parsed.base) : undefined);
    setIssuer(iss ?? "");
  }, [parsed, issuerTouched]);

  // Discovery results are tied to the issuer they were fetched for.
  useEffect(() => {
    setDiscovery(undefined);
    setDiscoveryError(undefined);
  }, [issuer]);

  const loadDiscovery = async () => {
    setLoading(true);
    setDiscoveryError(undefined);
    try {
      setDiscovery(await fetchDiscovery(issuer));
    } catch (e) {
      setDiscovery(undefined);
      setDiscoveryError(
        e instanceof FriendlyFetchError
          ? `${e.message} ${e.hint}`
          : e instanceof Error
            ? e.message
            : String(e),
      );
    } finally {
      setLoading(false);
    }
  };

  const findings: Finding[] = authorize?.findings ?? callback?.findings ?? [];

  return (
    <div className="not-prose">
      <PrivacyBanner>
        Parsing happens in your browser. The URL is never sent anywhere — the
        only optional request is to the issuer&apos;s own discovery document.
      </PrivacyBanner>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SectionLabel>Authorize or callback URL</SectionLabel>
        <div className="-mt-2 flex flex-wrap items-center gap-2">
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                setIssuerTouched(false);
                setInput(s.url);
              }}
              className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
            >
              {s.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setInput("")}
            disabled={!hasInput}
            className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        spellCheck={false}
        aria-label="Paste an authorize URL or callback URL"
        placeholder="https://host/realms/my-realm/protocol/openid-connect/auth?response_type=code&client_id=… — or a callback like https://app/callback?code=…&state=…"
        className="mb-6 w-full resize-y break-all rounded-2xl border border-white/10 bg-black/20 p-3 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500/60"
      />

      {!hasInput && (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
          Paste a URL above, or load one of the samples.
        </div>
      )}

      {pastedErrorText && <ErrorExplanationCard ex={pastedErrorText} />}

      {hasInput && !pastedErrorText && parsed.errors.length > 0 && (
        <div className="mb-4 flex flex-col gap-1.5">
          {parsed.errors.map((e) => (
            <StatusRow key={e} severity="warning">
              {e}
            </StatusRow>
          ))}
        </div>
      )}

      {parsed.kind !== "unknown" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Card>
              <SectionLabel>
                {parsed.kind === "authorize"
                  ? "Authorization request"
                  : "Authorization response (callback)"}
              </SectionLabel>
              {parsed.base && (
                <div className="mb-3 break-all font-mono text-xs text-gray-400">
                  {parsed.base}
                </div>
              )}
              {authorize?.flow && (
                <div className="mb-3 rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="text-sm font-semibold text-white">
                    {authorize.flow.name} flow
                  </div>
                  <div className="text-xs text-gray-400">
                    {authorize.flow.note}
                  </div>
                </div>
              )}
              {callback && (
                <div className="mb-3 text-xs text-gray-400">
                  Response delivered in the{" "}
                  {parsed.params.some((p) => p.source === "fragment")
                    ? "URL fragment (#…) — typical of implicit/hybrid flows"
                    : "query string"}
                  .
                </div>
              )}
              <FindingList findings={findings} />
            </Card>

            {callback?.error && (
              <ErrorExplanationCard
                ex={callback.error}
                description={callback.error.description}
                uri={callback.error.uri}
              />
            )}

            {parsed.kind === "authorize" && (
              <Card>
                <SectionLabel>Check against the issuer (optional)</SectionLabel>
                <div className="flex flex-col gap-2">
                  <TextInput
                    id="inspector-issuer"
                    label="Issuer"
                    value={issuer}
                    onChange={(v) => {
                      setIssuerTouched(true);
                      setIssuer(v);
                    }}
                    placeholder="https://host/realms/my-realm"
                    hint="Fetches /.well-known/openid-configuration to compare the endpoint and supported values."
                  />
                  <div>
                    <Button
                      variant="secondary"
                      onClick={loadDiscovery}
                      disabled={!issuer.trim() || loading}
                    >
                      {loading ? "Fetching…" : "Fetch discovery"}
                    </Button>
                  </div>
                  {discovery && (
                    <StatusRow severity="ok">
                      Loaded discovery for {discovery.issuer} — server checks
                      are included above.
                    </StatusRow>
                  )}
                  {discoveryError && (
                    <StatusRow severity="error">{discoveryError}</StatusRow>
                  )}
                </div>
              </Card>
            )}
          </div>

          <Card>
            <SectionLabel>Parameters</SectionLabel>
            <ParamTable rows={parsed.params} />
          </Card>
        </div>
      )}
    </div>
  );
}
