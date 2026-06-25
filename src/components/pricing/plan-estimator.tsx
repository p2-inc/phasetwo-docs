import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Tooltip } from "radix-ui";

/**
 * Plan estimator — Phase Two bills on *concurrent* sessions, not monthly active
 * users (MAU). Customers think in MAU, so we take MAU plus an average session
 * length and back into an estimate of peak concurrent sessions via Little's Law:
 *
 *   avg concurrent ≈ MAU × loginsPerDay × (sessionMinutes / minutesPerDay)
 *   peak concurrent ≈ avg concurrent × PEAK_FACTOR
 *
 * The two assumed constants below are deliberately conservative; the result is
 * an estimate to guide tier selection, not a quote.
 */
const LOGINS_PER_DAY = 1; // sessions started per active user per day
const PEAK_FACTOR = 3; // average → peak, accounting for business-hours clustering
const MINUTES_PER_DAY = 1440;

type TierKey = "starter" | "premium" | "enterprise" | "custom";

const TIERS: {
  key: TierKey;
  name: string;
  maxSessions: number;
  price: string;
  note?: string;
}[] = [
  {
    key: "starter",
    name: "Starter",
    maxSessions: 1_000,
    price: "$149/mo",
    note: "Starts with a 30-day free trial.",
  },
  { key: "premium", name: "Premium", maxSessions: 10_000, price: "$999/mo" },
  {
    key: "enterprise",
    name: "Enterprise",
    maxSessions: 50_000,
    price: "$2,999/mo",
  },
  {
    key: "custom",
    name: "Custom",
    maxSessions: Infinity,
    price: "Contact us",
    note: "For unlimited scale, multi-region, or on-premise.",
  },
];

function recommend(peakSessions: number) {
  return (
    TIERS.find((t) => peakSessions <= t.maxSessions) ?? TIERS[TIERS.length - 1]
  );
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="flex items-center gap-1.5 text-sm text-gray-300">
          {label}
          {hint && (
            <Tooltip.Provider delayDuration={200}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="inline-flex">
                    <Icon
                      icon="mdi:information-circle-outline"
                      className="size-4 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="z-[2000] max-w-xs rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm/6 text-gray-200 shadow-lg">
                    {hint}
                    <Tooltip.Arrow className="fill-[#1a1a1a]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </label>
        <span className="font-mono text-base font-semibold tabular-nums text-white">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-p2blue-500"
        aria-label={label}
      />
    </div>
  );
}

function formatSessionLength(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hr`;
}

export default function PlanEstimator() {
  const [mau, setMau] = useState(10_000);
  const [sessionMinutes, setSessionMinutes] = useState(60);

  const peakSessions = useMemo(() => {
    const avg = mau * LOGINS_PER_DAY * (sessionMinutes / MINUTES_PER_DAY);
    return Math.max(1, Math.round(avg * PEAK_FACTOR));
  }, [mau, sessionMinutes]);

  const tier = recommend(peakSessions);

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
                <Icon icon="mdi:function-variant" className="size-4" />
                How we estimate
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="z-[2000] max-w-xs rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm/6 text-gray-200 shadow-lg">
                We bill on concurrent sessions, not users. We estimate peak
                concurrent sessions from your monthly active users and average
                session length, assuming about one login per active user per day
                and a 3× peak-vs-average factor. It&apos;s a guide, not a quote.
                <Tooltip.Arrow className="fill-[#1a1a1a]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      <div className="mt-6 space-y-6">
        <Slider
          label="Monthly active users"
          value={mau}
          min={1_000}
          max={200_000}
          step={1_000}
          display={mau.toLocaleString()}
          onChange={setMau}
        />
        <Slider
          label="Average session length"
          hint="How long a user's session stays active before it expires or they log out. Longer sessions mean more are active at the same time."
          value={sessionMinutes}
          min={5}
          max={600}
          step={5}
          display={formatSessionLength(sessionMinutes)}
          onChange={setSessionMinutes}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:grid-cols-2">
        <div>
          <div className="text-xs text-gray-400">
            Est. peak concurrent sessions
          </div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">
            ~{peakSessions.toLocaleString()}
          </div>
        </div>
        <div className="sm:border-l sm:border-white/10 sm:pl-5">
          <div className="text-xs text-gray-400">Recommended plan</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{tier.name}</span>
          </div>
          {tier.note && (
            <div className="mt-1 text-xs text-gray-400">{tier.note}</div>
          )}
        </div>
      </div>
    </div>
  );
}
