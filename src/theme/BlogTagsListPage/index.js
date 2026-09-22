import React from "react";
import OriginalBlogTagsListPage from "@theme-original/BlogTagsListPage";
import NoIndexMeta from "@site/src/components/NoIndexMeta";

// Thin taxonomy hub: a list of tag links with no content of its own.
export default function BlogTagsListPage(props) {
  return (
    <>
      <NoIndexMeta />
      <OriginalBlogTagsListPage {...props} />
    </>
  );
}
