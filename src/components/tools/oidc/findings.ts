/** Shared lint-finding shape used by the JWKS and discovery linters. */
export type Severity = "error" | "warning" | "info" | "pass";

export type Finding = {
  severity: Severity;
  /** Short, one-line statement of the issue. */
  title: string;
  /** Optional longer explanation or remediation hint. */
  detail?: string;
  /** Stable identifier for the rule, useful for tests and filtering. */
  rule: string;
};

const ORDER: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
  pass: 3,
};

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
}

export function countBySeverity(findings: Finding[]): Record<Severity, number> {
  const out: Record<Severity, number> = {
    error: 0,
    warning: 0,
    info: 0,
    pass: 0,
  };
  for (const f of findings) out[f.severity]++;
  return out;
}
