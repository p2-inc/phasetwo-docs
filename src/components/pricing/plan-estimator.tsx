import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { Tooltip } from "radix-ui";

/**
 * Plan estimator — Phase Two sizes each cluster for a range of monthly active
 * users (MAU). A MAU is a user making up to ~1,000 token requests a month
 * (logins, refreshes, OIDC grant types, client-credential grants, etc.).
 *
 * The recommendation is the highest tier required across all inputs: the MAU
 * range AND any features/limits that have a tier floor (custom extensions and
 * IP allow/deny lists start at Premium; SSO-connection and custom-domain counts
 * each step up through the tiers).
 */
const ORDER = ["starter", "premium", "enterprise", "custom"] as const;
type TierKey = (typeof ORDER)[number];

const TIERS: Record<TierKey, { name: string; note: string }> = {
  starter: {
    name: "Starter",
    note: "Sized for up to ~15K MAU. Starts with a 30-day free trial.",
  },
  premium: { name: "Premium", note: "Sized for roughly 15K–100K MAU." },
  enterprise: { name: "Enterprise", note: "Sized for roughly 100K–250K MAU." },
  custom: {
    name: "Custom",
    note: "Above ~250K MAU — let's chat about a custom plan.",
  },
};

const rank = (k: TierKey) => ORDER.indexOf(k);
const mauTier = (m: number): TierKey =>
  m <= 15_000
    ? "starter"
    : m <= 100_000
      ? "premium"
      : m <= 250_000
        ? "enterprise"
        : "custom";
const ssoTier = (n: number): TierKey =>
  n <= 3 ? "starter" : n <= 10 ? "premium" : "enterprise";
const domainTier = (n: number): TierKey =>
  n <= 1 ? "starter" : n <= 5 ? "premium" : n <= 15 ? "enterprise" : "custom";

function InfoTip({
  children,
  size = "size-4",
}: {
  children: ReactNode;
  size?: string;
}) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="inline-flex">
            <Icon
              icon="mdi:information-circle-outline"
              className={`${size} cursor-help text-gray-400`}
              aria-hidden="true"
            />
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="z-[2000] max-w-xs rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm/6 text-gray-200 shadow-lg">
            {children}
            <Tooltip.Arrow className="fill-[#1a1a1a]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function NumberSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="font-mono text-sm font-semibold tabular-nums text-white">
          {value >= max ? `${max}+` : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-p2blue-500"
        aria-label={label}
      />
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-p2blue-500"
      />
      {children}
    </label>
  );
}

export default function PlanEstimator() {
  const [mau, setMau] = useState(10_000);
  const [sso, setSso] = useState(1);
  const [domains, setDomains] = useState(1);
  const [customExt, setCustomExt] = useState(false);
  const [ipList, setIpList] = useState(false);

  const { tier, bullets } = useMemo(() => {
    // One bullet per active input, each showing the tier it requires; the
    // recommendation is the highest tier across them all.
    const items: { key: TierKey; text: string }[] = [];
    const mt = mauTier(mau);
    items.push({
      key: mt,
      text: `${mau >= 300_000 ? "300K+" : mau.toLocaleString()} MAU → ${TIERS[mt].name}`,
    });
    if (sso > 3) {
      const k = ssoTier(sso);
      items.push({
        key: k,
        text: `${sso >= 20 ? "20+" : sso} SSO connections → ${TIERS[k].name}`,
      });
    }
    if (domains > 1) {
      const k = domainTier(domains);
      items.push({
        key: k,
        text: `${domains >= 20 ? "20+" : domains} custom domains → ${TIERS[k].name}`,
      });
    }
    if (customExt) {
      items.push({ key: "premium", text: "Custom extensions → Premium" });
    }
    if (ipList) {
      items.push({ key: "premium", text: "IP allow / deny lists → Premium" });
    }
    const topKey = items.reduce((a, b) =>
      rank(b.key) > rank(a.key) ? b : a,
    ).key;
    return { tier: TIERS[topKey], bullets: items.map((i) => i.text) };
  }, [mau, sso, domains, customExt, ipList]);

  return (
    <div className="rounded-[32px] border border-white/10 bg-[var(--ifm-background-surface-color)] p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h3 className="mb-0 text-lg font-semibold text-white">
          Estimate your plan
        </h3>
        <Tooltip.Provider delayDuration={200}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span className="inline-flex cursor-help items-center gap-1 text-xs text-gray-400">
                <Icon icon="mdi:information-outline" className="size-4" />
                What&apos;s a MAU?
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="z-[2000] max-w-xs rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm/6 text-gray-200 shadow-lg">
                A monthly active user (MAU) is a user making up to ~1,000 token
                requests a month — logins, token refreshes, OIDC grant types,
                client-credential grants, and similar. Each tier&apos;s cluster
                is sized to perform well across its MAU range.
                <Tooltip.Arrow className="fill-[#1a1a1a]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="mau-range" className="text-sm text-gray-300">
            Monthly active users
          </label>
          <span className="font-mono text-base font-semibold tabular-nums text-white">
            {mau >= 300_000 ? "300K+" : mau.toLocaleString()}
          </span>
        </div>
        <input
          id="mau-range"
          type="range"
          min={1_000}
          max={300_000}
          step={1_000}
          value={mau}
          onChange={(e) => setMau(Number(e.target.value))}
          className="mt-3 w-full accent-p2blue-500"
          aria-label="Monthly active users"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <NumberSlider
          label="SSO connections"
          value={sso}
          min={1}
          max={20}
          onChange={setSso}
        />
        <NumberSlider
          label="Custom domains"
          value={domains}
          min={1}
          max={20}
          onChange={setDomains}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CheckRow checked={customExt} onChange={setCustomExt}>
          Custom extensions
        </CheckRow>
        <CheckRow checked={ipList} onChange={setIpList}>
          IP allow / deny lists
        </CheckRow>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          Recommended plan
          <InfoTip size="size-3.5">
            Each cluster is sized to perform well up to its MAU range. Exceeding
            it isn&apos;t blocked or penalized — token-endpoint latency may
            increase. We monitor CPU and memory and proactively reach out as
            limits are approached.
          </InfoTip>
        </div>
        <div className="mt-1 text-2xl font-bold text-white">{tier.name}</div>
        <ul className="mb-0 ml-0 mt-3 list-none space-y-1.5 pl-0">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2 text-sm text-gray-400"
            >
              <span className="mt-2 size-1 flex-shrink-0 rounded-full bg-gray-500" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
