import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "@docusaurus/router";
import { usePluginData } from "@docusaurus/useGlobalData";
import { getMarkdownUrl } from "@site/plugins/markdown-source/lib/markdown-path";
import { isIncludedRoute } from "@site/plugins/markdown-source/lib/route-filter";
import styles from "./styles.module.css";

/**
 * "Copy as Markdown" control shown in the header of docs, tutorials, guides, updates
 * and blog posts.
 *
 * Every one of those pages is also published as raw markdown at the same URL with `.md`
 * appended — see plugins/markdown-source. This renders nothing on pages that have no
 * such twin, which is why it reads the same include/exclude lists the build used rather
 * than assuming one exists.
 */
export default function MarkdownActions() {
  const { pathname } = useLocation();
  const pluginData = usePluginData("markdown-source-plugin", undefined, {
    failfast: false,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);
  const resetTimerRef = useRef(null);

  // A pending "Copied!" reset must not fire after the reader has navigated away.
  useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  // Close the menu when the reader moves to another page.
  useEffect(() => {
    setIsOpen(false);
    setCopied(false);
  }, [pathname]);

  const markdownUrl = getMarkdownUrl(pathname);

  const handleCopy = useCallback(async () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    try {
      const response = await fetch(markdownUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await navigator.clipboard.writeText(await response.text());
      setCopied(true);
      resetTimerRef.current = setTimeout(() => {
        setCopied(false);
        resetTimerRef.current = null;
      }, 2000);
    } catch (error) {
      console.error("Failed to copy markdown:", error);
    }
    setIsOpen(false);
  }, [markdownUrl]);

  if (!pluginData || !isIncludedRoute(pathname, pluginData)) return null;

  return (
    <div className={styles.row}>
      <div className={styles.container} ref={containerRef}>
        <button
          type="button"
          className={styles.button}
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <CopyIcon className={styles.icon} />
          <span>{copied ? "Copied!" : "Copy as Markdown"}</span>
          <ChevronIcon className={styles.chevron} />
        </button>

        {isOpen && (
          <ul className={styles.menu} role="menu">
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={handleCopy}
              >
                <CopyIcon className={styles.icon} />
                <span>Copy page as Markdown</span>
              </button>
            </li>
            <li role="none">
              <a
                role="menuitem"
                className={styles.menuItem}
                href={markdownUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
              >
                <ExternalIcon className={styles.icon} />
                <span>View as Markdown</span>
              </a>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

function CopyIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25v-7.5Z"
      />
      <path
        fill="currentColor"
        d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25v-7.5Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25h-7.5Z"
      />
    </svg>
  );
}

function ExternalIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M10.604 1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 8.28 8.78a.75.75 0 0 1-1.06-1.06l4.75-4.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"
      />
      <path
        fill="currentColor"
        d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Z"
      />
    </svg>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="12"
      height="12"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M4.427 6.427a.25.25 0 0 1 .177-.427h6.792a.25.25 0 0 1 .177.427l-3.396 3.396a.25.25 0 0 1-.354 0L4.427 6.427Z"
      />
    </svg>
  );
}
