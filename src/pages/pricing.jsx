import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import { useEffect } from "react";

function Pricing() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  useEffect(() => {
    window.location = "/pricing/hosting";
  }, []);

  return <Layout description={`${siteConfig.tagline}`}></Layout>;
}

export default Pricing;
