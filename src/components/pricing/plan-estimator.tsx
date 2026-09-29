import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { Tooltip } from "radix-ui";

/**
 * Plan estimator — users are unlimited on every tier; what differs is the
 * active-user load the cluster is sized for. Sizing assumes an active user logs
 * in 30 times and refreshes 1,000 times a month. These are soft limits: nothing
 * is blocked or surcharged above them.
 *
 * The recommendation is the highest tier required across all inputs: the
 * active-user sizing AND any features/limits that have a tier floor (custom
 * extensions and IP allow/deny lists start at Premium; custom-domain counts
 * step up through the tiers).
 */
const ORDER = ["starter", "premium", "enterprise", "custom"] as const;
type TierKey = (typeof ORDER)[number];

const TIERS: Record<TierKey, { name: string; note: string }> = {
  starter: {
    name: "Starter",
    note: "Sized for ~5K active users. Starts with a 30-day free trial.",
  },
  premium: { name: "Premium", note: "Sized for roughly 5K–100K active users." },
  enterprise: {
    name: "Enterprise",
    note: "Sized for roughly 100K–500K active users.",
  },
  custom: {
    name: "Custom",
    note: "Above ~500K active users — let's size it together.",
  },
};

const rank = (k: TierKey) => ORDER.indexOf(k);
const activeUserTier = (m: number): TierKey =>
  m <= 5_000
    ? "starter"
    : m <= 100_000
      ? "premium"
      : m <= 500_000
        ? "enterprise"
        : "custom";
const domainTier = (n: number): TierKey =>
  n <= 2 ? "starter" : n <= 5 ? "premium" : n <= 15 ? "enterprise" : "custom";

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
  const [activeUsers, setActiveUsers] = useState(5_000);
  const [domains, setDomains] = useState(1);
  const [customExt, setCustomExt] = useState(false);
  const [ipList, setIpList] = useState(false);

  const { tier, bullets } = useMemo(() => {
    // One bullet per active input, each showing the tier it requires; the
    // recommendation is the highest tier across them all.
    const items: { key: TierKey; text: string }[] = [];
    const at = activeUserTier(activeUsers);
    items.push({
      key: at,
      text: `${activeUsers >= 600_000 ? "600K+" : activeUsers.toLocaleString()} active users → ${TIERS[at].name}`,
    });
    if (domains > 2) {
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
  }, [activeUsers, domains, customExt, ipList]);

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
                What&apos;s an active user?
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="z-[2000] max-w-xs rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm/6 text-gray-200 shadow-lg">
                Users are unlimited on every tier. For sizing we assume an
                active user logs in <strong>30 times</strong> and refreshes
                their token <strong>1,000 times</strong> per month. These are
                soft limits — nothing is blocked or surcharged above them.
                <Tooltip.Arrow className="fill-[#1a1a1a]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="active-users-range" className="text-sm text-gray-300">
            Active users
          </label>
          <span className="font-mono text-base font-semibold tabular-nums text-white">
            {activeUsers >= 600_000 ? "600K+" : activeUsers.toLocaleString()}
          </span>
        </div>
        <input
          id="active-users-range"
          type="range"
          min={1_000}
          max={600_000}
          step={1_000}
          value={activeUsers}
          onChange={(e) => setActiveUsers(Number(e.target.value))}
          className="mt-3 w-full accent-p2blue-500"
          aria-label="Active users"
        />
        <p className="mb-0 mt-2 text-xs text-gray-500">
          Registered users are always unlimited — this is the active load the
          cluster is sized for.
        </p>
      </div>

      <div className="mt-6">
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
            Each cluster is sized to perform well up to its active-user range.
            There is no restriction on exceeding it — nothing is blocked or
            surcharged — but performance may degrade. We monitor CPU and memory,
            reach out proactively, and work with you to tune the use case or
            resize the cluster.
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
