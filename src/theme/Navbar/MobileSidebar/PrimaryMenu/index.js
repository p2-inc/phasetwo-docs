import React, { useState } from "react";
import clsx from "clsx";
import { useThemeConfig } from "@docusaurus/theme-common";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import NavbarItem from "@theme/NavbarItem";

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

function MegaMenuMobileAccordion({ item, onClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
    if (isExpanded) {
      setOpenSection(null);
    }
  };

  const toggleSection = (title) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  return (
    <li
      className={clsx("menu__list-item", {
        "menu__list-item--collapsed": !isExpanded,
      })}
    >
      <div className="menu__list-item-collapsible">
        <a
          role="button"
          href="#"
          className="menu__link menu__link--sublist"
          onClick={(e) => {
            e.preventDefault();
            toggleExpanded();
          }}
        >
          {item.label}
        </a>
        <button
          type="button"
          className="clean-btn menu__caret"
          aria-label={isExpanded ? "Collapse Product" : "Expand Product"}
          aria-expanded={isExpanded}
          onClick={toggleExpanded}
        />
      </div>
      {isExpanded && (
        <ul className="menu__list">
          {item.megaMenu.sections.map((section) => {
            const isOpen = openSection === section.title;
            return (
              <li
                key={section.title}
                className={clsx("menu__list-item", styles.megaMenuSectionItem, {
                  "menu__list-item--collapsed": !isOpen,
                })}
              >
                <div className="menu__list-item-collapsible">
                  <a
                    role="button"
                    href="#"
                    className="menu__link menu__link--sublist"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSection(section.title);
                    }}
                  >
                    {section.title}
                  </a>
                  <button
                    type="button"
                    className="clean-btn menu__caret"
                    aria-label={
                      isOpen
                        ? `Collapse ${section.title}`
                        : `Expand ${section.title}`
                    }
                    aria-expanded={isOpen}
                    onClick={() => toggleSection(section.title)}
                  />
                </div>
                {isOpen && (
                  <ul className="menu__list">
                    {(section.links || []).map((link) => (
                      <li key={link.label} className="menu__list-item">
                        <NavbarItem
                          mobile
                          isDropdownLink
                          to={link.to}
                          href={link.href}
                          label={link.label}
                          onClick={onClick}
                          className="menu__link"
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export default function NavbarMobilePrimaryMenu() {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems();

  return (
    <ul className="menu__list">
      {items.map((item, i) =>
        isMegaMenuItem(item) ? (
          <MegaMenuMobileAccordion
            key={i}
            item={item}
            onClick={() => mobileSidebar.toggle()}
          />
        ) : (
          <NavbarItem
            mobile
            {...item}
            onClick={() => mobileSidebar.toggle()}
            key={i}
          />
        )
      )}
    </ul>
  );
}
