import React from "react";
import OriginalBlogAuthorsListPage from "@theme-original/Blog/Pages/BlogAuthorsListPage";
import NoIndexMeta from "@site/src/components/NoIndexMeta";

// Thin taxonomy hub: a list of author links with no content of its own.
export default function BlogAuthorsListPage(props) {
  return (
    <>
      <NoIndexMeta />
      <OriginalBlogAuthorsListPage {...props} />
    </>
  );
}
