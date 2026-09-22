import React from "react";
import OriginalBlogArchivePage from "@theme-original/BlogArchivePage";
import NoIndexMeta from "@site/src/components/NoIndexMeta";

// Thin archive: post titles that all have a canonical home on the post itself.
export default function BlogArchivePage(props) {
  return (
    <>
      <NoIndexMeta />
      <OriginalBlogArchivePage {...props} />
    </>
  );
}
