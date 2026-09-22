import React from "react";
import OriginalBlogAuthorsPostsPage from "@theme-original/Blog/Pages/BlogAuthorsPostsPage";
import NoIndexMeta from "@site/src/components/NoIndexMeta";

// Per-author archive: post titles that all have a canonical home on the post itself.
export default function BlogAuthorsPostsPage(props) {
  return (
    <>
      <NoIndexMeta />
      <OriginalBlogAuthorsPostsPage {...props} />
    </>
  );
}
