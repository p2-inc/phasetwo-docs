import React from "react";
import styles from "./styles.module.css";
import { InlineIcon } from "@iconify/react/dist/iconify.js";

const CheckMark = () => (
  <img
    src="/img/checkmark.svg"
    alt="Checkmark"
    style={{ height: ".9rem" }}
    loading="lazy"
  ></img>
);
const Dash = () => <span className={styles.notPartOfPlan}>&mdash;</span>;

const features = [
  {
    feature: "Architecture review",
    silver: <CheckMark />,
    gold: <CheckMark />,
  },
  {
    feature: "Installation and configuration support",
    silver: <CheckMark />,
    gold: <CheckMark />,
  },
  { feature: "Email support", silver: <CheckMark />, gold: <CheckMark /> },
  { feature: "Slack support", silver: <Dash />, gold: <CheckMark /> },
  { feature: "Phone support", silver: <Dash />, gold: <CheckMark /> },
  {
    feature: (
      <span>
        Support hours <span style={{ opacity: 0.5 }}>(US EST)</span>
      </span>
    ),
    silver: "9x5",
    gold: "24x7x365",
  },
  {
    feature: (
      <span>
        Response time <span style={{ opacity: 0.5 }}>(hours)</span>
      </span>
    ),
    silver: "24",
    gold: "4",
  },
  { feature: "Health assessment", silver: "Quarterly", gold: "Monthly" },
  {
    feature: (
      <span>
        Incl. service hours <span style={{ opacity: 0.5 }}>(/mth)</span>
      </span>
    ),
    silver: (
      <span>
        10 <span style={{ opacity: 0.5 }}>(max)</span>
      </span>
    ),
    gold: "20",
  },
  {
    feature: "Custom development",
    silver: <Dash />,
    gold: <CheckMark />,
  },
  {
    feature: (
      <span>
        Pricing <span style={{ opacity: 0.5 }}>(/mth)</span>
      </span>
    ),
    silver: (
      <span>
        <span style={{ opacity: 0.5 }}>from</span> $3,500
      </span>
    ),
    gold: (
      <span>
        <span style={{ opacity: 0.5 }}>from</span> $7,500
      </span>
    ),
  },
];

export const KeycloakSupportPackages = () => {
  return (
    <div className={styles.planSupport} id="experts">
      <div className={styles.plan}>
        <div className={styles.planHead}>
          <img
            className={styles.featCardPicto}
            src="/img/plan-community.svg"
            alt="Enterprise plan"
            loading="lazy"
          />
          <h3>Enterprise Keycloak Support Packages</h3>
        </div>
        <div className={styles.tableThemeWrapper}>
          <table className={styles.tableTheme}>
            <thead>
              <tr>
                <th></th>
                <th>
                  <InlineIcon
                    icon="map:chairlift"
                    style={{ fontSize: "1.8rem", color: "#40a2e3" }}
                  />
                  <br />
                  Silver
                </th>
                <th>
                  <InlineIcon
                    icon="ph:cable-car-light"
                    style={{ fontSize: "3.2rem", color: "#40a2e3" }}
                  />
                  <br />
                  Gold
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map(({ feature, silver, gold }) => (
                <tr>
                  <td>{feature}</td>
                  <td>{silver}</td>
                  <td>{gold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.planFoot}>
          <a
            href="mailto:sales@phasetwo.io"
            className={styles.planFootA}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className={`btnPrimary ${styles.btnPlan}`}>
              Contact sales
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};
