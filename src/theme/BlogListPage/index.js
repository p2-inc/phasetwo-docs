import React from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from "@docusaurus/theme-common";
import BlogLayout from "@theme/BlogLayout";
import BlogListPaginator from "@theme/BlogListPaginator";
import SearchMetadata from "@theme/SearchMetadata";
import BlogPostItems from "@theme/BlogPostItems";
import BlogListPageStructuredData from "@theme/BlogListPage/StructuredData";
import NoIndexMeta from "@site/src/components/NoIndexMeta";
function BlogListPageMetadata(props) {
  const { metadata } = props;
  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext();
  const { blogDescription, blogTitle, permalink, page } = metadata;
  const isBlogOnlyMode = permalink === "/";
  const title = isBlogOnlyMode ? siteTitle : blogTitle;
  // This component renders both the blog landing page and /blog/page/2, /page/3
  // and so on. `page` is the 1-based page number from the blog plugin, so page 1
  // is the landing page and must stay indexable; only the pagination tail, which
  // is a reshuffling of posts that already have canonical homes, gets noindex.
  const isPaginatedPage = page > 1;
  return (
    <>
      <PageMetadata title={title} description={blogDescription} />
      {isPaginatedPage && <NoIndexMeta />}
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}
function BlogListPageContent(props) {
  const { metadata, items, sidebar } = props;
  return (
    <BlogLayout sidebar={sidebar}>
      <BlogPostItems items={items} />
      <BlogListPaginator metadata={metadata} />
    </BlogLayout>
  );
}
export default function BlogListPage(props) {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
      )}
    >
      <BlogListPageMetadata {...props} />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
