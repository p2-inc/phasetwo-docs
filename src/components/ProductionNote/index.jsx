import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

/**
 * Closing block for every tutorial.
 *
 * The tutorials are deliberately vendor-neutral — they teach open-source Keycloak and run
 * on any deployment. This is the single place Phase Two is mentioned, so the tutorial stays
 * useful to people who will never be customers, which is the entire point of the section.
 *
 * Keep it short and keep it honest. If a tutorial needs a Phase Two-specific step to work
 * at all, the tutorial is in the wrong section.
 */
export default function ProductionNote({ children }) {
  return (
    <aside className={styles.wrapper}>
      <p className={styles.body}>
        {children ?? (
          <>
            Everything above runs on any Keycloak instance. When you need it running in
            production — upgrades, backups, HA, and someone on call — that is what we do.
          </>
        )}
      </p>
      <p className={styles.links}>
        <Link to="/hosting/dedicated-clusters/">Managed Keycloak hosting</Link>
        {" · "}
        <Link to="/support/">Enterprise Keycloak support</Link>
        {" · "}
        <Link to="/extensions/">Our open-source extensions</Link>
      </p>
    </aside>
  );
}
