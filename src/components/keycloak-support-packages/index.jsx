import React from "react";
import styles from "./styles.module.css";

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10.1791 1.10639C10.4179 0.94065 10.7419 0.968577 10.952 1.19004L11.8198 2.10514C12.0601 2.35857 12.0601 2.76937 11.8198 3.02277L4.43508 10.81C4.19476 11.0633 3.80519 11.0633 3.56488 10.81L0.18022 7.24085C-0.0600894 6.98744 -0.0600573 6.57664 0.18022 6.32321L1.04802 5.40811L1.14417 5.32446C1.38281 5.15833 1.70789 5.18687 1.91822 5.40811L3.99998 7.597L10.0818 1.19004L10.1791 1.10639Z" fill="black" />
  </svg>
);

const CheckMark = () => (
  <span
    className="inline-flex size-6 flex-none items-center justify-center rounded-full border-[1.5px] border-p2blue-400 bg-p2blue-500"
    aria-hidden="true"
  >
    <CheckIcon />
  </span>
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
        <div className={`${styles.tableThemeWrapper} pt-8`}>
          <table className={styles.tableTheme}>
            <thead>
              <tr>
                <th></th>
                <th className="text-white">
                  <img
                    src="/img/support-hosting-silver.svg"
                    alt=""
                    style={{ width: "64px" }}
                    loading="lazy"
                  />
                  <br />
                  Silver
                </th>
                <th className="text-white">
                  <img
                    src="/img/support-hosting-gold.svg"
                    alt=""
                    style={{ width: "64px" }}
                    loading="lazy"
                  />
                  <br />
                  Gold
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map(({ feature, silver, gold }, idx) => (
                <tr key={idx}>
                  <td className="text-gray-300">{feature}</td>
                  <td className="text-gray-300">{silver}</td>
                  <td className="text-gray-300">{gold}</td>
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
            <button className={`btnPrimary btnSupport ${styles.btnPlan}`}>
              Contact sales
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};
