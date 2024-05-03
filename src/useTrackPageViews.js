import { useEffect } from "react";
import { useLocation } from "@docusaurus/router";

function useTrackPageViews() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag(
        "set",
        "page_path",
        location.pathname + location.search + location.hash
      );
      window.gtag("event", "page_view");
    }
  }, [location]);

  return null;
}

export default useTrackPageViews;
