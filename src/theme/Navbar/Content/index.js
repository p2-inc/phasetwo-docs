import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  ErrorCauseBoundary,
  ThemeClassNames,
  useThemeConfig,
  useWindowSize,
} from "@docusaurus/theme-common";
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from "@docusaurus/theme-common/internal";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import DemoModal from "@site/src/components/DemoModal";

function normalizePath(p) {
  if (!p) return p;
  return p.startsWith("/") || /^https?:\/\//.test(p) ? p : `/${p}`;
}
import NavbarColorModeToggle from "@theme/Navbar/ColorModeToggle";
import NavbarItem from "@theme/NavbarItem";
import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";
import NavbarLogo from "@theme/Navbar/Logo";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import NavbarSearch from "@theme/Navbar/Search";
import SearchBar from "@theme/SearchBar";

import { NAV_ICONS, IconExt } from "./NavRevIcons";
import styles from "./styles.module.css";

function useNavbarItems() {
  return useThemeConfig().navbar.items || [];
}

function isMegaMenuItem(item) {
  return (
    item?.type === "dropdown" &&
    Array.isArray(item?.megaMenu?.sections) &&
    item.megaMenu.sections.length > 0
  );
}

function NavRevLink({ link }) {
  const icon = link.icon ? NAV_ICONS[link.icon] : null;
  return (
    <Link
      to={normalizePath(link.to)}
      href={link.href}
      className={clsx("dropdown__link", styles.navRevLink)}
    >
      <span className={styles.navRevIcon}>{icon}</span>
      <span className={styles.navRevLinkTitle}>
        <strong>{link.label}</strong>
        {link.sub ? <small>{link.sub}</small> : null}
      </span>
      <span className={styles.navRevExt}>
        {link.href || link.ext ? <IconExt /> : null}
      </span>
    </Link>
  );
}

function FeaturedCard({ card }) {
  return (
    <Link
      to={normalizePath(card.to)}
      href={card.href}
      className={styles.navRevFeaturedCard}
    >
      {card.tag ? (
        <span className={styles.navRevFeaturedTag}>{card.tag}</span>
      ) : null}
      {card.title ? <h4>{card.title}</h4> : null}
      {card.desc ? <p>{card.desc}</p> : null}
      {card.cta ? (
        <span className={styles.navRevFeaturedCta}>{card.cta} →</span>
      ) : null}
    </Link>
  );
}

// Section column: 220px (room for icon + title + one-line subtitle).
// Featured column: 260px, pinned as the rightmost grid track.
// Menu width is set to max-content in CSS, so total width = sum of these.
const SECTION_COL = "220px";
const FEATURED_COL = "260px";

function buildMenuStyle(megaMenu, pos) {
  const sectionCount = megaMenu.sections.length;
  const hasFeatured =
    Array.isArray(megaMenu.featured) && megaMenu.featured.length > 0;
  const cols =
    megaMenu.cols ||
    (hasFeatured
      ? `repeat(${sectionCount}, ${SECTION_COL}) ${FEATURED_COL}`
      : `repeat(${sectionCount}, ${SECTION_COL})`);
  return {
    "--nav-rev-cols": cols,
    left: pos ? `${pos.left}px` : undefined,
    top: pos ? `${pos.top}px` : undefined,
  };
}

function MegaMenuNavbarItem({
  label,
  to,
  className,
  position,
  megaMenu,
  children,
  onDemoClick,
}) {
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuPos, setMenuPos] = useState(null);

  const readGutter = () => {
    if (typeof window === "undefined") return 16;
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--margin-right")
      .trim();
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0 ? n : 16;
  };

  const updatePos = useCallback(() => {
    const trigger = dropdownRef.current;
    if (!trigger || typeof window === "undefined") return;
    const r = trigger.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const gutter = readGutter();
    // Compute the natural content width: sections (220px each) + featured
    // column (260px) + 24px gaps + 24px padding on each side.
    const sectionCount = megaMenu.sections.length;
    const hasFeatured =
      Array.isArray(megaMenu.featured) && megaMenu.featured.length > 0;
    const trackCount = sectionCount + (hasFeatured ? 1 : 0);
    const computed =
      sectionCount * 220 +
      (hasFeatured ? 260 : 0) +
      Math.max(0, trackCount - 1) * 24 +
      48;
    const menuWidth = Math.min(
      megaMenu.width || computed,
      viewportW - gutter * 2,
    );
    let left = r.left;
    if (left + menuWidth > viewportW - gutter) {
      left = viewportW - gutter - menuWidth;
    }
    if (left < gutter) left = gutter;
    setMenuPos({ left, top: r.bottom + 6 });
  }, [megaMenu]);

  const openMenu = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updatePos();
    setShowDropdown(true);
  }, [updatePos]);

  const scheduleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setShowDropdown(false);
      closeTimerRef.current = null;
    }, 150);
  }, []);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  useLayoutEffect(() => {
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [updatePos]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current || dropdownRef.current.contains(event.target)) {
        return;
      }
      setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("focusin", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("focusin", handleClickOutside);
    };
  }, []);

  const hasFeatured =
    Array.isArray(megaMenu.featured) && megaMenu.featured.length > 0;
  const hasFooter =
    megaMenu.footer &&
    (megaMenu.footer.left ||
      (megaMenu.footer.links && megaMenu.footer.links.length > 0));

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      className={clsx(
        "navbar__item",
        "dropdown",
        styles.megaMenuDropdown,
        {
          "dropdown--right": position === "right",
          "dropdown--show": showDropdown,
        },
      )}
    >
      <NavbarNavLink
        aria-haspopup="true"
        aria-expanded={showDropdown}
        role="button"
        href={to ? undefined : "#"}
        to={to}
        label={label}
        className={clsx("navbar__link", className)}
        onFocus={openMenu}
        onClick={to ? undefined : (e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (showDropdown) {
              setShowDropdown(false);
            } else {
              openMenu();
            }
          }
        }}
      >
        {children ?? label}
      </NavbarNavLink>
      <ul
        className={clsx("dropdown__menu", styles.navRevMenu)}
        style={buildMenuStyle(megaMenu, menuPos)}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        {megaMenu.sections.map((section) => (
          <li className={styles.navRevSection} key={section.title}>
            <span
              className={clsx(styles.navRevChip, {
                [styles.navRevChipMagenta]: section.accent === "magenta",
              })}
            >
              {section.title}
            </span>
            {section.description ? (
              <p className={styles.navRevSectionDesc}>{section.description}</p>
            ) : null}
            <ul className={styles.navRevList}>
              {(section.links || []).map((link) => (
                <li key={`${section.title}-${link.label}`}>
                  <NavRevLink link={link} />
                </li>
              ))}
            </ul>
          </li>
        ))}

        {hasFeatured ? (
          <li className={styles.navRevSection}>
            <ul className={styles.navRevFeatured}>
              {megaMenu.featured.map((card, i) => (
                <li key={i}>
                  <FeaturedCard card={card} />
                </li>
              ))}
            </ul>
          </li>
        ) : null}

        {hasFooter ? (
          <li className={styles.navRevFooter}>
            <span className={styles.navRevFooterLeft}>
              {megaMenu.footer.left}
            </span>
            <span className={styles.navRevFooterRight}>
              {(megaMenu.footer.links || []).map((l, i) => {
                if (l.variant === "sales" && onDemoClick) {
                  return (
                    <button
                      key={i}
                      type="button"
                      className={styles.navRevFooterCtaSales}
                      onClick={() => {
                        onDemoClick();
                        setShowDropdown(false);
                      }}
                    >
                      {l.label} →
                    </button>
                  );
                }
                return (
                  <Link
                    key={i}
                    to={normalizePath(l.to)}
                    href={l.href}
                    className={clsx({
                      [styles.navRevFooterCtaTry]: l.variant === "try",
                      [styles.navRevFooterCtaSales]: l.variant === "sales",
                    })}
                  >
                    {l.label} →
                  </Link>
                );
              })}
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function MegaMenuMobileFallback({ label, megaMenu, ...rest }) {
  const flatItems = megaMenu.sections.flatMap((section) =>
    (section.links || []).map((link) => ({
      ...link,
      label: `${section.title}: ${link.label}`,
    })),
  );
  return (
    <NavbarItem type="dropdown" label={label} items={flatItems} {...rest} />
  );
}

function NavbarItems({ items, isMobile, onDemoClick }) {
  return (
    <>
      {items.map((item, i) => (
        <ErrorCauseBoundary
          key={i}
          onError={(error) =>
            new Error(
              `A theme navbar item failed to render.
Please double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:
${JSON.stringify(item, null, 2)}`,
              { cause: error },
            )
          }
        >
          {isMegaMenuItem(item) ? (
            isMobile ? (
              <MegaMenuMobileFallback {...item} />
            ) : (
              <MegaMenuNavbarItem {...item} onDemoClick={onDemoClick} />
            )
          ) : (
            <NavbarItem {...item} />
          )}
        </ErrorCauseBoundary>
      ))}
    </>
  );
}

function NavbarContentLayout({ left, right }) {
  return (
    <div className="navbar__inner">
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerLeft,
          "navbar__items",
        )}
      >
        {left}
      </div>
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerRight,
          "navbar__items navbar__items--right",
        )}
      >
        {right}
      </div>
    </div>
  );
}

export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(items);
  const searchBarItem = items.find((item) => item.type === "search");
  const windowSize = useWindowSize();
  const isMobile = windowSize === "mobile";
  const githubIconUrl = useBaseUrl("img/icon-github.svg");

  const { siteConfig } = useDocusaurusContext();
  const customFields = siteConfig?.customFields || {};
  const demoRequestEndpoint =
    typeof customFields.demoRequestEndpoint === "string"
      ? customFields.demoRequestEndpoint
      : "";
  const turnstileSiteKey =
    typeof customFields.turnstileSiteKey === "string"
      ? customFields.turnstileSiteKey
      : "";
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const openDemo = useCallback(() => setDemoModalOpen(true), []);

  return (
    <>
      <NavbarContentLayout
        left={
          <>
            {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
            <NavbarLogo />
          </>
        }
        right={
          <>
            <NavbarItems
              items={leftItems}
              isMobile={isMobile}
              onDemoClick={openDemo}
            />
            <NavbarItems
              items={rightItems}
              isMobile={isMobile}
              onDemoClick={openDemo}
            />
            <NavbarColorModeToggle className={styles.colorModeToggle} />
            {!searchBarItem && (
              <NavbarSearch>
                <SearchBar />
              </NavbarSearch>
            )}
            <a
              href="https://github.com/p2-inc"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar__item navbar__github-icon"
              aria-label="GitHub"
            >
              <img src={githubIconUrl} alt="" width={20} height={20} />
            </a>
          </>
        }
      />
      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        demoRequestEndpoint={demoRequestEndpoint}
        turnstileSiteKey={turnstileSiteKey}
      />
    </>
  );
}
