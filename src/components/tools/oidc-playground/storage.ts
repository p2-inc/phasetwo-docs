/**
 * sessionStorage helpers for the playground's transient flow state. Every
 * access is wrapped in try/catch: storage can be unavailable (SSR, private
 * windows, blocked site data) and the tool must still render.
 *
 * sessionStorage is per-tab and cleared when the tab closes. Tokens are never
 * written here — only what is needed to finish the redirect round trip.
 */

const KEY = "p2.oidc-playground.v1";

export type PlaygroundConfig = {
  issuer: string;
  clientId: string;
  scope: string;
  extra: Record<string, string>;
};

/** State that must survive the redirect to the authorization server and back. */
export type PendingFlow = {
  /** Which redirect we are waiting on. */
  kind: "login" | "logout";
  state: string;
  nonce?: string;
  codeVerifier?: string;
  redirectUri: string;
  /** The issuer the flow was started against (for iss / mix-up checks). */
  issuer: string;
  createdAt: number;
};

export type StoredState = {
  config?: PlaygroundConfig;
  pending?: PendingFlow;
};

export function loadState(): StoredState {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredState) : {};
  } catch {
    return {};
  }
}

export function saveState(next: StoredState): boolean {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function updateState(patch: Partial<StoredState>): boolean {
  return saveState({ ...loadState(), ...patch });
}

export function clearState(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
