import React from "react";
import OriginalSearchPage from "@theme-original/SearchPage";
import NoIndexMeta from "@site/src/components/NoIndexMeta";

// Search results are user-generated URLs, not pages we want indexed. The upstream component emits property="robots", which crawlers do not read as a robots directive; this adds the name="robots" form that they do.
export default function SearchPage(props) {
  return (
    <>
      <NoIndexMeta />
      <OriginalSearchPage {...props} />
    </>
  );
}
