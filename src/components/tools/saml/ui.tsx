import { useState, type ReactNode } from "react";
import Link from "@docusaurus/Link";
import { Icon } from "../Icon";

import type { HintLink } from "./core/index.ts";

/* Small building blocks shared by the SAML decoder panels. */

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </div>
  );
}

export function IconBtn({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white"
    >
      <Icon icon={icon} className="size-4" />
    </button>
  );
}

export function CopyIconBtn({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <IconBtn
      icon={copied ? "mdi:check" : "mdi:content-copy"}
      label={`Copy ${label}`}
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
    />
  );
}

export function StatusRow({
  icon,
  cls,
  children,
}: {
  icon: string;
  cls: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex items-start gap-1.5 text-sm ${cls}`}>
      <Icon icon={icon} className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

/** A bordered card with a title bar, matching the JWT decoder's panels. */
export function Card({
  title,
  actions,
  children,
}: {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-2.5">
        <h3 className="mb-0 text-sm font-semibold uppercase tracking-wide text-p2blue-400">
          {title}
        </h3>
        {actions && <div className="flex items-center gap-0.5">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/** Link that uses client-side routing for phasetwo.io paths and a new tab for external ones. */
export function DocLink({
  link,
  className,
}: {
  link: HintLink;
  className?: string;
}) {
  const cls = className ?? "text-p2blue-400 hover:underline";
  if (link.href.startsWith("/"))
    return (
      <Link to={link.href} className={cls}>
        {link.label}
      </Link>
    );
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
    >
      {link.label}
      <Icon
        icon="mdi:open-in-new"
        className="ml-0.5 inline size-3 align-[-1px]"
      />
    </a>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return (
    <span className="break-all font-mono text-[0.8rem] text-white">
      {children}
    </span>
  );
}
