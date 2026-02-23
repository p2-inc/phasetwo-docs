/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useState } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import isInternalUrl from "@docusaurus/isInternalUrl";

import SearchBar from "@theme/SearchBar";
import Toggle from "@theme/Toggle";

import classnames from "classnames";

import useThemeContext from "@theme/hooks/useThemeContext";
import useHideableNavbar from "@theme/hooks/useHideableNavbar";
import useLockBodyScroll from "@theme/hooks/useLockBodyScroll";

import styles from "./styles.module.css";

import keycloak from "./auth";

function AuthLink() {
  const opts = { redirectUri: window.location.href };

  return (
    <div>
      <div>{`User is ${
        !keycloak.authenticated ? "NOT " : ""
      }authenticated`}</div>
      {!!keycloak.authenticated && (
        <button type="button" onClick={() => keycloak.logout()}>
          Logout
        </button>
      )}
    </div>
  );
}

function NavLink({ activeBasePath, to, href, label, position, ...props }) {
  const toUrl = useBaseUrl(to);
  const activeBaseUrl = useBaseUrl(activeBasePath);

  return (
    <Link
      className="navbar__item navbar__link"
      {...(href
        ? {
            target: "_blank",
            rel: "noopener noreferrer",
            href,
          }
        : {
            activeclassname: "navbar__link--active",
            to: toUrl,
            ...(activeBasePath
              ? {
                  isActive: (_match, location) =>
                    location.pathname.startsWith(activeBaseUrl),
                }
              : null),
          })}
      {...props}
    >
      {label}
    </Link>
  );
}

function Navbar() {
  const { siteConfig = {}, isClient } = useDocusaurusContext();
  const { baseUrl, themeConfig = {} } = siteConfig;
  const { navbar = {}, disableDarkMode = false } = themeConfig;
  const { title, logo = {}, links = [], hideOnScroll = false } = navbar;

  const [sidebarShown, setSidebarShown] = useState(false);
  const { isDarkTheme, setLightTheme, setDarkTheme } = useThemeContext();
  const { navbarRef, isNavbarVisible } = useHideableNavbar(hideOnScroll);

  useLockBodyScroll(sidebarShown);

  const showSidebar = useCallback(() => {
    setSidebarShown(true);
  }, [setSidebarShown]);
  const hideSidebar = useCallback(() => {
    setSidebarShown(false);
  }, [setSidebarShown]);

  const onToggleChange = useCallback(
    (e) => (e.target.checked ? setDarkTheme() : setLightTheme()),
    [setLightTheme, setDarkTheme]
  );

  const logoLink = logo.href || baseUrl;
  let logoLinkProps = {};

  if (logo.target) {
    logoLinkProps = { target: logo.target };
  } else if (!isInternalUrl(logoLink)) {
    logoLinkProps = {
      rel: "noopener noreferrer",
      target: "_blank",
    };
  }

  const logoSrc = logo.srcDark && isDarkTheme ? logo.srcDark : logo.src;
  const logoImageUrl = useBaseUrl(logoSrc);

  const leftItems = links.filter(
    (linkItem) =>
      linkItem.position !== "right" &&
      linkItem.label !== "Contact" &&
      linkItem.label !== "Dashboard"
  );
  const rightItems = links.filter(
    (linkItem) =>
      linkItem.position === "right" &&
      linkItem.label !== "Contact" &&
      linkItem.label !== "Dashboard"
  );
  const contactButton = links.find((item) => item.label === "Contact");
  const dashboardButton = links.find((item) => item.label === "Dashboard");

  return (
    <nav
      ref={navbarRef}
      className={classnames("navbar", "navbar--light", "navbar--fixed-top", {
        "navbar-sidebar--show": sidebarShown,
        [styles.navbarHideable]: hideOnScroll,
        [styles.navbarHidden]: !isNavbarVisible,
      })}
    >
      <div className="navbar__inner">
        <div className="navbar__items">
          <div
            aria-label="Navigation bar toggle"
            className="navbar__toggle"
            role="button"
            tabIndex={0}
            onClick={showSidebar}
            onKeyDown={showSidebar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 30 30"
              role="img"
              focusable="false"
            >
              <title>Menu</title>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeMiterlimit="10"
                strokeWidth="2"
                d="M4 7h22M4 15h22M4 23h22"
              />
            </svg>
          </div>
          <Link className="navbar__brand" to={logoLink} {...logoLinkProps}>
            {logo != null && (
              <img
                key={isClient}
                className="navbar__logo"
                src={logoImageUrl}
                alt={logo.alt}
              />
            )}
            {title != null && (
              <strong className="navbar__title">{title}</strong>
            )}
          </Link>
        </div>
        <div className="navbarMain">
          {leftItems.map((linkItem, i) => (
            <NavLink {...linkItem} key={i} />
          ))}
        </div>
        <div className="navbarMainRight">
          {rightItems.map((linkItem, i) => (
            <NavLink {...linkItem} key={i} />
          ))}
        </div>

        <div className="navbar__items navbar__items--right">
          <div className="navbar__search-item">
            <SearchBar />
          </div>
          {/* GitHub Icon */}
          <a
            href="https://github.com/p2-inc/"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__item navbar__github-icon"
            aria-label="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          {/* Contact Button */}
          {contactButton && (
            <Link
              to={contactButton.to}
              className={classnames(
                "navbar__item",
                "navbar__contact-button",
                contactButton.buttonType === "btnPrimary"
                  ? "btnPrimary"
                  : contactButton.buttonType === "btnSecondary"
                  ? "btnSecondary"
                  : ""
              )}
              data-button-type={contactButton.buttonType}
            >
              {contactButton.label}
            </Link>
          )}
          {/* Dashboard Button */}
          {dashboardButton && (
            <Link
              href={dashboardButton.href}
              className={classnames(
                "navbar__item",
                "navbar__dashboard-button",
                dashboardButton.buttonType === "btnPrimary"
                  ? "btnPrimary"
                  : dashboardButton.buttonType === "btnSecondary"
                  ? "btnSecondary"
                  : ""
              )}
              data-button-type={dashboardButton.buttonType}
            >
              {dashboardButton.label}
            </Link>
          )}
        </div>
      </div>
      <div
        role="presentation"
        className="navbar-sidebar__backdrop"
        onClick={hideSidebar}
      />
      <div className="navbar-sidebar">
        <div className="navbar-sidebar__brand">
          <Link
            className="navbar__brand"
            onClick={hideSidebar}
            to={logoLink}
            {...logoLinkProps}
          >
            {logo != null && (
              <img
                key={isClient}
                className="navbar__logo"
                src={logoImageUrl}
                alt={logo.alt}
              />
            )}
            {title != null && (
              <strong className="navbar__title">{title}</strong>
            )}
          </Link>
          {!disableDarkMode && sidebarShown && (
            <Toggle
              aria-label="Dark mode toggle in sidebar"
              checked={isDarkTheme}
              onChange={onToggleChange}
            />
          )}
        </div>
        <div className="navbar-sidebar__items">
          <div className="menu">
            <ul className="menu__list">
              {links.map((linkItem, i) => (
                <li className="menu__list-item" key={i}>
                  <NavLink
                    className="menu__link"
                    {...linkItem}
                    onClick={hideSidebar}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
