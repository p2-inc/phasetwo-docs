import { useEffect, useState } from "react";
import {
  challengeS256,
  generateCodeVerifier,
  validateCodeVerifier,
  VERIFIER_MAX_LENGTH,
  VERIFIER_MIN_LENGTH,
} from "./pkce";
import {
  Button,
  Card,
  CopyButton,
  PrivacyBanner,
  SectionLabel,
  StatusRow,
} from "./ui";

function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-gray-300">{label}</div>
      <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
        <code className="min-w-0 flex-1 break-all border-0 bg-transparent p-0 text-sm text-white">
          {value || "—"}
        </code>
        {value && <CopyButton value={value} label={label} />}
      </div>
    </div>
  );
}

export default function PkceGenerator() {
  const [length, setLength] = useState(64);
  const [verifier, setVerifier] = useState("");
  const [s256, setS256] = useState("");

  // Generate on mount only (never during SSR).
  useEffect(() => {
    setVerifier(generateCodeVerifier(64));
  }, []);

  const check = validateCodeVerifier(verifier);

  useEffect(() => {
    let cancelled = false;
    if (!verifier) {
      setS256("");
      return;
    }
    challengeS256(verifier).then((c) => {
      if (!cancelled) setS256(c);
    });
    return () => {
      cancelled = true;
    };
  }, [verifier]);

  return (
    <div className="not-prose mx-auto max-w-3xl">
      <PrivacyBanner>
        Generated in your browser with the Web Crypto API. Nothing is sent to a
        server, logged, or stored.
      </PrivacyBanner>

      <Card className="flex flex-col gap-4">
        <div>
          <SectionLabel>code_verifier</SectionLabel>
          <textarea
            value={verifier}
            onChange={(e) => setVerifier(e.target.value.trim())}
            rows={3}
            spellCheck={false}
            aria-label="code_verifier"
            placeholder="Generate one, or paste your own verifier to compute its challenge"
            className="w-full resize-y break-all rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500/60"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button onClick={() => setVerifier(generateCodeVerifier(length))}>
              Generate new verifier
            </Button>
            <label className="flex items-center gap-2 text-xs text-gray-400">
              Length
              <input
                type="range"
                min={VERIFIER_MIN_LENGTH}
                max={VERIFIER_MAX_LENGTH}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                aria-label="Verifier length"
              />
              <span className="w-8 font-mono text-white">{length}</span>
            </label>
            {verifier && (
              <CopyButton value={verifier} label="verifier" text="Copy" />
            )}
          </div>
          {verifier && (
            <div className="mt-3 flex flex-col gap-1">
              {check.ok ? (
                <StatusRow severity="ok">
                  Valid code_verifier ({verifier.length} characters).
                </StatusRow>
              ) : (
                check.problems.map((p) => (
                  <StatusRow key={p} severity="error">
                    {p}
                  </StatusRow>
                ))
              )}
            </div>
          )}
        </div>

        <ValueRow label="code_challenge (S256 — use this)" value={s256} />
        <ValueRow
          label="code_challenge (plain — not recommended)"
          value={verifier}
        />

        {s256 && (
          <div>
            <div className="mb-1 text-xs font-medium text-gray-300">
              Authorize request parameters
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <code className="min-w-0 flex-1 break-all border-0 bg-transparent p-0 text-sm text-gray-200">
                {`code_challenge=${s256}&code_challenge_method=S256`}
              </code>
              <CopyButton
                value={`code_challenge=${s256}&code_challenge_method=S256`}
                label="parameters"
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Then send <code>code_verifier={"<verifier>"}</code> in the token
              request along with the code.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
