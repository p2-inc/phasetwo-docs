import React from "react";
import BlogPostItem from "@theme-original/BlogPostItem";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import AuthorBio from "@site/src/components/AuthorBio";

/**
 * Appends the author bio to the foot of a post.
 *
 * Only on the post page itself — the blog list renders BlogPostItem too, and a bio
 * under every excerpt would be noise.
 */
export default function BlogPostItemWrapper(props) {
  const { metadata, isBlogPostPage } = useBlogPost();
  return (
    <>
      <BlogPostItem {...props} />
      {isBlogPostPage && <AuthorBio authors={metadata.authors} />}
    </>
  );
}
