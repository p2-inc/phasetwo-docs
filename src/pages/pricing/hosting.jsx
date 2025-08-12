import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import { useEffect } from "react";
import DetailedPriceComparison from "../../components/pricing/detailed-comparison";

function Pricing() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  useEffect(() => {
    document.body.classList.add("page-bg");
  });

  return (
    <Layout description={`${siteConfig.tagline}`}>
      <div className="container">
        <DetailedPriceComparison />
      </div>
      <div className="container">
        <p>
          Starter tier subject to availability. (1) Additional fees based on
          extension complexity.
        </p>
      </div>
    </Layout>
  );
}

export default Pricing;
