/**
 * XML Canonicalization (C14N 1.0 and Exclusive C14N 1.0) over the tree
 * produced by `parseXml`. These are the two canonicalization methods SAML
 * signatures use in practice; anything else is reported as unsupported by
 * the signature verifier rather than guessed at.
 *
 * References:
 *   https://www.w3.org/TR/2001/REC-xml-c14n-20010315
 *   https://www.w3.org/TR/2002/REC-xml-exc-c14n-20020718/
 */

import {
  inScopeNamespaces,
  XML_NS,
  type XmlAttribute,
  type XmlElement,
  type XmlNode,
} from "./xml.ts";

export const C14N_ALGORITHMS = {
  INCLUSIVE: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
  INCLUSIVE_WITH_COMMENTS:
    "http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments",
  EXCLUSIVE: "http://www.w3.org/2001/10/xml-exc-c14n#",
  EXCLUSIVE_WITH_COMMENTS:
    "http://www.w3.org/2001/10/xml-exc-c14n#WithComments",
} as const;

export type C14nOptions = {
  /** Exclusive (true) or inclusive (false) canonicalization. */
  exclusive: boolean;
  withComments?: boolean;
  /** Exclusive C14N `InclusiveNamespaces PrefixList`; use "#default" or "" for the default namespace. */
  inclusivePrefixes?: string[];
  /** A descendant element to omit, e.g. the enveloped `ds:Signature`. */
  exclude?: XmlElement;
};

/** Map a canonicalization algorithm URI to options, or `undefined` if unsupported. */
export function c14nOptionsFor(
  algorithm: string,
): Omit<C14nOptions, "exclude" | "inclusivePrefixes"> | undefined {
  switch (algorithm) {
    case C14N_ALGORITHMS.INCLUSIVE:
      return { exclusive: false, withComments: false };
    case C14N_ALGORITHMS.INCLUSIVE_WITH_COMMENTS:
      return { exclusive: false, withComments: true };
    case C14N_ALGORITHMS.EXCLUSIVE:
      return { exclusive: true, withComments: false };
    case C14N_ALGORITHMS.EXCLUSIVE_WITH_COMMENTS:
      return { exclusive: true, withComments: true };
  }
  return undefined;
}

function escapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r/g, "&#xD;");
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/\t/g, "&#x9;")
    .replace(/\n/g, "&#xA;")
    .replace(/\r/g, "&#xD;");
}

const byString = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Canonicalize the subtree rooted at `apex` (in the context of its ancestors). */
export function canonicalize(apex: XmlElement, opts: C14nOptions): string {
  const out: string[] = [];
  const inclusive = new Set(
    (opts.inclusivePrefixes ?? []).map((p) => (p === "#default" ? "" : p)),
  );

  const renderElement = (
    el: XmlElement,
    inScope: Map<string, string>,
    rendered: Map<string, string>,
    isApex: boolean,
  ) => {
    const decls: [string, string][] = [];
    const consider = (prefix: string) => {
      if (prefix === "xml") return;
      const uri = inScope.get(prefix) ?? "";
      if (prefix === "") {
        // xmlns="" is emitted only to undo a non-empty default rendered on an output ancestor.
        if (uri !== (rendered.get("") ?? "")) decls.push(["", uri]);
        return;
      }
      if (rendered.get(prefix) !== uri) decls.push([prefix, uri]);
    };

    if (opts.exclusive) {
      const used = new Set<string>([el.prefix]);
      for (const a of el.attributes)
        if (a.prefix && a.prefix !== "xml") used.add(a.prefix);
      for (const p of inclusive) if (inScope.has(p)) used.add(p);
      for (const p of used) consider(p);
    } else {
      if (!inScope.has("")) consider("");
      for (const p of inScope.keys()) consider(p);
    }
    decls.sort((a, b) => byString(a[0], b[0]));

    let attrs: XmlAttribute[] = el.attributes;
    if (isApex && !opts.exclusive) {
      // Inclusive C14N of a document subset: xml:* attributes are inherited.
      const own = new Set(
        attrs.filter((a) => a.namespaceURI === XML_NS).map((a) => a.localName),
      );
      const inherited: XmlAttribute[] = [];
      for (let p = el.parent; p; p = p.parent) {
        for (const a of p.attributes) {
          if (a.namespaceURI === XML_NS && !own.has(a.localName)) {
            own.add(a.localName);
            inherited.push(a);
          }
        }
      }
      attrs = attrs.concat(inherited);
    }
    attrs = [...attrs].sort(
      (a, b) =>
        byString(a.namespaceURI, b.namespaceURI) ||
        byString(a.localName, b.localName),
    );

    out.push("<", el.name);
    for (const [p, uri] of decls)
      out.push(p ? ` xmlns:${p}="` : ` xmlns="`, escapeAttr(uri), '"');
    for (const a of attrs)
      out.push(" ", a.name, '="', escapeAttr(a.value), '"');
    out.push(">");

    let childRendered = rendered;
    if (decls.length) {
      childRendered = new Map(rendered);
      for (const [p, uri] of decls) childRendered.set(p, uri);
    }
    for (const c of el.children) renderNode(c, el, inScope, childRendered);
    out.push("</", el.name, ">");
  };

  const renderNode = (
    n: XmlNode,
    parent: XmlElement,
    parentScope: Map<string, string>,
    rendered: Map<string, string>,
  ) => {
    switch (n.type) {
      case "text":
        out.push(escapeText(n.value));
        return;
      case "comment":
        if (opts.withComments) out.push("<!--", n.value, "-->");
        return;
      case "pi":
        out.push("<?", n.target, n.data ? " " + n.data : "", "?>");
        return;
      case "element": {
        if (n === opts.exclude) return;
        let scope = parentScope;
        if (n.namespaces.length) {
          scope = new Map(parentScope);
          for (const d of n.namespaces) scope.set(d.prefix, d.uri);
        }
        renderElement(n, scope, rendered, false);
      }
    }
  };

  renderElement(apex, inScopeNamespaces(apex), new Map(), true);
  return out.join("");
}
