import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import { useEffect } from "react";

function Hosting() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  useEffect(() => {
    window.location = "/hosting/dedicated-clusters/";
  }, []);

  return <Layout description={`${siteConfig.tagline}`}></Layout>;
}

export default Hosting;
