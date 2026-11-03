/**
 * Validity-window checks for the timestamps in a SAML message.
 */

import type { SamlSummary } from "./saml.ts";

export type TimeState = "ok" | "expired" | "not-yet-valid" | "info" | "invalid";

export type TimeCheck = {
  /** Where the timestamp came from, e.g. "Conditions NotOnOrAfter". */
  label: string;
  /** The raw xs:dateTime value. */
  value: string;
  epochMs?: number;
  /** "in 4 minutes", "3 hours ago". */
  relative: string;
  state: TimeState;
  /** Plain-English explanation, including clock-skew advice near a boundary. */
  note?: string;
};

export type TimeCheckOptions = {
  /** Current time in epoch milliseconds. */
  now: number;
  /** Tolerance applied to boundaries, like an SP's allowed clock skew. Default 0. */
  clockSkewSeconds?: number;
  /** A boundary missed by less than this is called out as a likely clock-skew problem. Default 300. */
  nearSeconds?: number;
};

/** Parse an xs:dateTime. SAML requires UTC; a value with no zone is read as UTC and flagged. */
export function parseSamlInstant(v: string): { ms?: number; noZone: boolean } {
  const s = v.trim();
  const noZone = !/(Z|[+-]\d{2}:?\d{2})$/i.test(s);
  const ms = Date.parse(noZone ? s + "Z" : s);
  return { ms: Number.isNaN(ms) ? undefined : ms, noZone };
}

/** Human relative time, e.g. "in 5 minutes" or "2 days ago". */
export function relativeTime(targetMs: number, now: number): string {
  const diff = targetMs - now;
  const abs = Math.abs(diff);
  if (abs < 1000) return "right now";
  const units: [number, string][] = [
    [86_400_000 * 365, "year"],
    [86_400_000 * 30, "month"],
    [86_400_000, "day"],
    [3_600_000, "hour"],
    [60_000, "minute"],
    [1000, "second"],
  ];
  for (const [ms, name] of units) {
    if (abs >= ms) {
      const n = Math.floor(abs / ms);
      const s = `${n} ${name}${n === 1 ? "" : "s"}`;
      return diff > 0 ? `in ${s}` : `${s} ago`;
    }
  }
  return "right now";
}

function seconds(ms: number): string {
  const s = Math.floor(Math.abs(ms) / 1000);
  return s < 120 ? `${s} seconds` : `${Math.floor(s / 60)} minutes`;
}

type Kind = "notBefore" | "notOnOrAfter" | "instant";

/** Evaluate every timestamp in the summary against `now`. */
export function checkTimes(
  summary: SamlSummary,
  opts: TimeCheckOptions,
): TimeCheck[] {
  const { now } = opts;
  const skew = (opts.clockSkewSeconds ?? 0) * 1000;
  const near = (opts.nearSeconds ?? 300) * 1000;
  const out: TimeCheck[] = [];

  const add = (label: string, value: string | undefined, kind: Kind) => {
    if (!value) return;
    const { ms, noZone } = parseSamlInstant(value);
    if (ms === undefined) {
      out.push({
        label,
        value,
        relative: "unparseable",
        state: "invalid",
        note: "Not a valid xs:dateTime.",
      });
      return;
    }
    const check: TimeCheck = {
      label,
      value,
      epochMs: ms,
      relative: relativeTime(ms, now),
      state: "info",
    };
    if (kind === "notBefore") {
      if (now + skew < ms) {
        check.state = "not-yet-valid";
        const ahead = ms - now;
        check.note =
          ahead <= near
            ? `Not valid for another ${seconds(ahead)}. A gap this small usually means the IdP's clock is ahead of the SP's — sync clocks (NTP) or allow some clock skew at the SP.`
            : "Not valid yet.";
      } else {
        check.state = "ok";
        if (now < ms)
          check.note = `Starts ${seconds(ms - now)} from now, but within the ${skew / 1000}-second clock-skew tolerance.`;
      }
    } else if (kind === "notOnOrAfter") {
      if (now - skew >= ms) {
        check.state = "expired";
        const past = now - ms;
        check.note =
          past <= near
            ? `Expired ${seconds(past)} ago. If the SP rejected this right after login, its clock may be ahead of the IdP's, or the validity window is too short.`
            : "Expired. Old messages cannot be replayed; capture a fresh one.";
      } else {
        check.state = "ok";
        if (now >= ms)
          check.note = `Passed ${seconds(now - ms)} ago, but within the ${skew / 1000}-second clock-skew tolerance.`;
      }
    } else if (ms - skew > now && ms - now > 1000) {
      check.state = "not-yet-valid";
      check.note = `Issued ${seconds(ms - now)} in the future — the issuer's clock is ahead of yours.`;
    }
    if (noZone)
      check.note = `${check.note ? check.note + " " : ""}No time zone given; SAML timestamps must be UTC ("Z").`;
    out.push(check);
  };

  add("Message IssueInstant", summary.issueInstant, "instant");
  if (summary.messageType === "LogoutRequest")
    add("LogoutRequest NotOnOrAfter", summary.notOnOrAfter, "notOnOrAfter");
  summary.assertions.forEach((a, i) => {
    const p = summary.assertions.length > 1 ? `Assertion ${i + 1} ` : "";
    if (
      summary.messageType !== "Assertion" ||
      a.issueInstant !== summary.issueInstant
    )
      add(`${p}Assertion IssueInstant`, a.issueInstant, "instant");
    add(`${p}Conditions NotBefore`, a.conditions?.notBefore, "notBefore");
    add(
      `${p}Conditions NotOnOrAfter`,
      a.conditions?.notOnOrAfter,
      "notOnOrAfter",
    );
    for (const sc of a.subjectConfirmations) {
      add(`${p}SubjectConfirmationData NotBefore`, sc.notBefore, "notBefore");
      add(
        `${p}SubjectConfirmationData NotOnOrAfter`,
        sc.notOnOrAfter,
        "notOnOrAfter",
      );
    }
    for (const st of a.authnStatements) {
      add(`${p}AuthnInstant`, st.authnInstant, "instant");
      add(`${p}SessionNotOnOrAfter`, st.sessionNotOnOrAfter, "notOnOrAfter");
    }
  });
  return out;
}

/** True when any boundary was missed by less than `nearSeconds` — the typical clock-skew signature. */
export function hasClockSkewSymptom(
  checks: TimeCheck[],
  now: number,
  nearSeconds = 300,
): boolean {
  return checks.some(
    (c) =>
      c.epochMs !== undefined &&
      (c.state === "expired" || c.state === "not-yet-valid") &&
      Math.abs(c.epochMs - now) <= nearSeconds * 1000,
  );
}
