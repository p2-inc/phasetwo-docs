import React, { useEffect, useRef, useState } from "react";
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
import NavbarColorModeToggle from "@theme/Navbar/ColorModeToggle";
import NavbarItem from "@theme/NavbarItem";
import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";
import NavbarLogo from "@theme/Navbar/Logo";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import NavbarSearch from "@theme/Navbar/Search";
import SearchBar from "@theme/SearchBar";

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

function MegaMenuNavbarItem({
  label,
  to,
  className,
  position,
  megaMenu,
  children,
}) {
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

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

  return (
    <div
      ref={dropdownRef}
      className={clsx(
        "navbar__item",
        "dropdown",
        "dropdown--hoverable",
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
        onClick={to ? undefined : (e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            setShowDropdown(!showDropdown);
          }
        }}
      >
        {children ?? label}
      </NavbarNavLink>
      <ul className={clsx("dropdown__menu", styles.megaMenu)}>
        {megaMenu.sections.map((section) => (
          <li className={styles.megaMenuSection} key={section.title}>
            <p className={styles.megaMenuSectionTitle}>{section.title}</p>
            <ul className={styles.megaMenuSectionLinks}>
              {(section.links || []).map((link) => (
                <li key={`${section.title}-${link.label}`}>
                  <NavbarNavLink
                    isDropdownLink
                    className="dropdown__link"
                    to={link.to}
                    href={link.href}
                    label={link.label}
                    activeBasePath={link.activeBasePath}
                    activeBaseRegex={link.activeBaseRegex}
                    prependBaseUrlToHref={link.prependBaseUrlToHref}
                  />
                </li>
              ))}
            </ul>
          </li>
        ))}
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

function NavbarItems({ items, isMobile }) {
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
              <MegaMenuNavbarItem {...item} />
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

  return (
    <NavbarContentLayout
      left={
        <>
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
          <NavbarLogo />
        </>
      }
      right={
        <>
          <NavbarItems items={leftItems} isMobile={isMobile} />
          <NavbarItems items={rightItems} isMobile={isMobile} />
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
  );
}
