import React from "react";
import Content from "@theme-original/BlogPostItem/Content";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import MarkdownActions from "@site/src/components/MarkdownActions";

/**
 * Puts the "Copy as Markdown" control above the body of a blog post.
 *
 * Only on the post page itself — the blog list renders BlogPostItem too, and a control
 * over every excerpt would be noise (and would copy the wrong page).
 */
export default function ContentWrapper(props) {
  const { isBlogPostPage } = useBlogPost();
  return (
    <>
      {isBlogPostPage && <MarkdownActions />}
      <Content {...props} />
    </>
  );
}
