import React from "react";
import Content from "@theme-original/DocItem/Content";
import MarkdownActions from "@site/src/components/MarkdownActions";

/**
 * Puts the "Copy as Markdown" control above the body of every doc, tutorial, guide and
 * update page.
 *
 * The API reference renders through @theme/ApiItem instead of this component, so the
 * generated reference pages are unaffected — which matches the plugin's exclude list.
 */
export default function ContentWrapper(props) {
  return (
    <>
      <MarkdownActions />
      <Content {...props} />
    </>
  );
}
