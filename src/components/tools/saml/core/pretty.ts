/**
 * Pretty-print a parsed document as a flat token stream, so any UI can
 * syntax-highlight it without re-parsing. `tokens.map(t => t.text).join("")`
 * is the pretty-printed XML.
 *
 * Pretty printing changes whitespace, which breaks XML signatures — it is for
 * reading only. Verify signatures against the original message.
 */

import type { XmlDocument, XmlElement, XmlNode } from "./xml.ts";

export type XmlTokenKind =
  | "punct"
  | "tag"
  | "attr"
  | "ns"
  | "value"
  | "text"
  | "comment"
  | "pi"
  | "space";
export type XmlToken = { kind: XmlTokenKind; text: string };

const escText = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "&#xA;")
    .replace(/\t/g, "&#x9;");

export type PrettyOptions = {
  indent?: string;
  /** Wrap attributes onto separate lines past this width. Default 100. */ wrapWidth?: number;
};

export function prettyPrintTokens(
  doc: XmlDocument,
  opts: PrettyOptions = {},
): XmlToken[] {
  const indent = opts.indent ?? "  ";
  const wrap = opts.wrapWidth ?? 100;
  const out: XmlToken[] = [];
  const push = (kind: XmlTokenKind, text: string) => out.push({ kind, text });

  const startTag = (el: XmlElement, depth: number, selfClose: boolean) => {
    const pad = indent.repeat(depth);
    const attrs: { kind: "ns" | "attr"; name: string; value: string }[] = [
      ...el.namespaces.map((n) => ({
        kind: "ns" as const,
        name: n.prefix ? `xmlns:${n.prefix}` : "xmlns",
        value: n.uri,
      })),
      ...el.attributes.map((a) => ({
        kind: "attr" as const,
        name: a.name,
        value: a.value,
      })),
    ];
    const oneLine =
      pad.length +
      el.name.length +
      2 +
      attrs.reduce(
        (n, a) => n + a.name.length + escAttr(a.value).length + 4,
        0,
      );
    const multi = attrs.length > 1 && oneLine > wrap;
    push("punct", "<");
    push("tag", el.name);
    for (const a of attrs) {
      push("space", multi ? "\n" + pad + indent + indent : " ");
      push(a.kind, a.name);
      push("punct", '="');
      push("value", escAttr(a.value));
      push("punct", '"');
    }
    push("punct", selfClose ? "/>" : ">");
  };

  const endTag = (el: XmlElement) => {
    push("punct", "</");
    push("tag", el.name);
    push("punct", ">");
  };

  const inline = (n: XmlNode) => {
    if (n.type === "text") push("text", escText(n.value));
    else if (n.type === "comment") push("comment", `<!--${n.value}-->`);
    else if (n.type === "pi")
      push("pi", `<?${n.target}${n.data ? " " + n.data : ""}?>`);
    else {
      startTag(n, 0, n.children.length === 0);
      if (n.children.length) {
        n.children.forEach(inline);
        endTag(n);
      }
    }
  };

  const block = (n: XmlNode, depth: number) => {
    const pad = indent.repeat(depth);
    if (n.type === "text") {
      const v = n.value.trim();
      if (v) {
        push("space", pad);
        push("text", escText(v));
        push("space", "\n");
      }
      return;
    }
    if (n.type === "comment" || n.type === "pi") {
      push("space", pad);
      inline(n);
      push("space", "\n");
      return;
    }
    push("space", pad);
    if (!n.children.length) {
      startTag(n, depth, true);
      push("space", "\n");
      return;
    }
    startTag(n, depth, false);
    const hasElements = n.children.some((c) => c.type === "element");
    const hasText = n.children.some((c) => c.type === "text" && c.value.trim());
    if (!hasElements && n.children.every((c) => c.type === "text")) {
      // Text-only content: keep it on one line, trimmed of surrounding layout whitespace.
      push(
        "text",
        escText(
          n.children
            .map((c) => (c as { value: string }).value)
            .join("")
            .trim(),
        ),
      );
    } else if (hasText || !hasElements) {
      // Mixed content: reproduce exactly.
      n.children.forEach(inline);
    } else {
      push("space", "\n");
      for (const c of n.children) block(c, depth + 1);
      push("space", pad);
    }
    endTag(n);
    push("space", "\n");
  };

  for (const p of doc.prolog) block(p, 0);
  block(doc.root, 0);
  if (out.length && out[out.length - 1].text === "\n") out.pop();
  return out;
}

/** Pretty-printed XML as a string. */
export function prettyPrintXml(doc: XmlDocument, opts?: PrettyOptions): string {
  return prettyPrintTokens(doc, opts)
    .map((t) => t.text)
    .join("");
}
