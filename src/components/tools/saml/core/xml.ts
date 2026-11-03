/**
 * A small, namespace-aware, non-validating XML parser.
 *
 * SAML messages are plain XML with no DTDs, so a full DOM is unnecessary. A
 * self-contained parser keeps the core portable (it runs in Node, browsers,
 * and extension service workers, none of which share a DOM implementation)
 * and gives the canonicalizer exact control over the data model.
 *
 * Deliberately rejected: DOCTYPE declarations (SAML forbids them, and they
 * are the vector for entity-expansion attacks) and undeclared entities.
 */

export const XML_NS = "http://www.w3.org/XML/1998/namespace";
export const XMLNS_NS = "http://www.w3.org/2000/xmlns/";

export type XmlAttribute = {
  /** Qualified name as written, e.g. `xsi:type`. */
  name: string;
  prefix: string;
  localName: string;
  /** Resolved namespace URI; empty string for unprefixed attributes. */
  namespaceURI: string;
  /** Normalized, entity-decoded value. */
  value: string;
};

export type XmlNamespaceDecl = {
  /** Empty string for the default namespace (`xmlns="..."`). */
  prefix: string;
  uri: string;
};

export type XmlElement = {
  type: "element";
  name: string;
  prefix: string;
  localName: string;
  namespaceURI: string;
  attributes: XmlAttribute[];
  namespaces: XmlNamespaceDecl[];
  children: XmlNode[];
  parent: XmlElement | null;
};

export type XmlText = { type: "text"; value: string; cdata?: boolean };
export type XmlComment = { type: "comment"; value: string };
export type XmlPI = { type: "pi"; target: string; data: string };
export type XmlNode = XmlElement | XmlText | XmlComment | XmlPI;

export type XmlDocument = {
  root: XmlElement;
  /** Comments / PIs that appear before the root element. */
  prolog: (XmlComment | XmlPI)[];
};

export class XmlParseError extends Error {
  /** Character offset (after line-ending normalization) of the problem. */
  readonly offset: number;
  constructor(message: string, offset: number) {
    super(message);
    this.name = "XmlParseError";
    this.offset = offset;
  }
}

const NAME_RE = /^[A-Za-z_:À-￿][\w.\-:·À-￿]*/;

function decodeEntities(raw: string, offset: number): string {
  if (raw.indexOf("&") === -1) return raw;
  return raw.replace(/&([^;\s&]*);?/g, (m, ent: string) => {
    if (!m.endsWith(";")) {
      throw new XmlParseError("Unterminated entity reference.", offset);
    }
    switch (ent) {
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "amp":
        return "&";
      case "quot":
        return '"';
      case "apos":
        return "'";
    }
    let code: number;
    if (/^#x[0-9a-fA-F]+$/.test(ent)) code = parseInt(ent.slice(2), 16);
    else if (/^#[0-9]+$/.test(ent)) code = parseInt(ent.slice(1), 10);
    else
      throw new XmlParseError(
        `Unknown entity "&${ent};" (DTDs are not supported).`,
        offset,
      );
    if (code > 0x10ffff)
      throw new XmlParseError("Invalid character reference.", offset);
    return String.fromCodePoint(code);
  });
}

function splitName(name: string): { prefix: string; localName: string } {
  const i = name.indexOf(":");
  return i === -1
    ? { prefix: "", localName: name }
    : { prefix: name.slice(0, i), localName: name.slice(i + 1) };
}

type RawElement = XmlElement & { rawAttrs: { name: string; value: string }[] };

/** Parse an XML string. Throws {@link XmlParseError} on malformed input. */
export function parseXml(input: string): XmlDocument {
  // XML 1.0 §2.11 end-of-line handling, and strip a leading BOM.
  const src = input.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  let pos = 0;
  const prolog: (XmlComment | XmlPI)[] = [];
  let root: XmlElement | null = null;
  const stack: RawElement[] = [];

  const fail = (msg: string): never => {
    throw new XmlParseError(msg, pos);
  };

  const pushChild = (node: XmlNode) => {
    const parent = stack[stack.length - 1];
    if (parent) parent.children.push(node);
    else if (node.type === "comment" || node.type === "pi") prolog.push(node);
    else if (node.type === "text") {
      if (node.value.trim()) fail("Text content outside the root element.");
    }
  };

  while (pos < src.length) {
    const lt = src.indexOf("<", pos);
    if (lt === -1) {
      const rest = src.slice(pos);
      if (stack.length) fail("Unexpected end of input: unclosed element.");
      if (rest.trim()) fail("Text content after the root element.");
      break;
    }
    if (lt > pos) {
      const raw = src.slice(pos, lt);
      if (stack.length)
        pushChild({ type: "text", value: decodeEntities(raw, pos) });
      else if (raw.trim()) fail("Text content outside the root element.");
    }
    pos = lt;

    if (src.startsWith("<!--", pos)) {
      const end = src.indexOf("-->", pos + 4);
      if (end === -1) fail("Unterminated comment.");
      pushChild({ type: "comment", value: src.slice(pos + 4, end) });
      pos = end + 3;
      continue;
    }
    if (src.startsWith("<![CDATA[", pos)) {
      if (!stack.length) fail("CDATA section outside the root element.");
      const end = src.indexOf("]]>", pos + 9);
      if (end === -1) fail("Unterminated CDATA section.");
      pushChild({ type: "text", value: src.slice(pos + 9, end), cdata: true });
      pos = end + 3;
      continue;
    }
    if (src.startsWith("<!DOCTYPE", pos) || src.startsWith("<!", pos)) {
      fail("DOCTYPE declarations are not allowed in SAML messages.");
    }
    if (src.startsWith("<?", pos)) {
      const end = src.indexOf("?>", pos + 2);
      if (end === -1) fail("Unterminated processing instruction.");
      const body = src.slice(pos + 2, end);
      const m = /^(\S+)\s*([\s\S]*)$/.exec(body);
      if (!m) fail("Malformed processing instruction.");
      const target = m![1];
      // The XML declaration is not a node in the data model.
      if (target.toLowerCase() !== "xml") {
        pushChild({ type: "pi", target, data: m![2] });
      } else if (pos !== 0 && src.slice(0, pos).trim()) {
        fail("The XML declaration must be at the very start of the document.");
      }
      pos = end + 2;
      continue;
    }
    if (src.startsWith("</", pos)) {
      const end = src.indexOf(">", pos);
      if (end === -1) fail("Unterminated end tag.");
      const name = src.slice(pos + 2, end).trim();
      const open = stack.pop();
      if (!open) fail(`Unexpected end tag </${name}>.`);
      if (open!.name !== name)
        fail(
          `Mismatched end tag: expected </${open!.name}> but found </${name}>.`,
        );
      pos = end + 1;
      if (!stack.length) {
        const rest = src.slice(pos);
        // Only comments, PIs and whitespace may follow the root.
        const tail = rest
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/<\?[\s\S]*?\?>/g, "");
        if (tail.trim()) fail("Content after the root element.");
        pos = src.length;
      }
      continue;
    }

    // Start tag.
    pos++;
    const nm = NAME_RE.exec(src.slice(pos, pos + 512));
    if (!nm) fail("Malformed start tag.");
    const name = nm![0];
    pos += name.length;
    const rawAttrs: { name: string; value: string }[] = [];
    let selfClosing = false;
    for (;;) {
      const ws = /^\s*/.exec(src.slice(pos, pos + 256))![0];
      pos += ws.length;
      if (pos >= src.length) fail("Unexpected end of input inside a tag.");
      if (src[pos] === ">") {
        pos++;
        break;
      }
      if (src.startsWith("/>", pos)) {
        selfClosing = true;
        pos += 2;
        break;
      }
      if (!ws && rawAttrs.length)
        fail("Attributes must be separated by whitespace.");
      const an = NAME_RE.exec(src.slice(pos, pos + 512));
      if (!an) fail(`Malformed attribute in <${name}>.`);
      pos += an![0].length;
      const eq = /^\s*=\s*/.exec(src.slice(pos, pos + 256));
      if (!eq) fail(`Attribute "${an![0]}" has no value.`);
      pos += eq![0].length;
      const q = src[pos];
      if (q !== '"' && q !== "'")
        fail(`Attribute "${an![0]}" value must be quoted.`);
      const close = src.indexOf(q, pos + 1);
      if (close === -1) fail("Unterminated attribute value.");
      const rawVal = src.slice(pos + 1, close);
      if (rawVal.includes("<")) fail(`"<" is not allowed in attribute values.`);
      // Attribute-value normalization (§3.3.3) for CDATA attributes: literal
      // whitespace becomes a space; character references are preserved.
      const value = decodeEntities(rawVal.replace(/[\t\n]/g, " "), pos);
      if (rawAttrs.some((a) => a.name === an![0]))
        fail(`Duplicate attribute "${an![0]}".`);
      rawAttrs.push({ name: an![0], value });
      pos = close + 1;
    }

    const parent = stack[stack.length - 1] ?? null;
    if (!parent && root) fail("Only one root element is allowed.");
    const { prefix, localName } = splitName(name);
    const el: RawElement = {
      type: "element",
      name,
      prefix,
      localName,
      namespaceURI: "",
      attributes: [],
      namespaces: [],
      children: [],
      parent,
      rawAttrs,
    };
    if (parent) parent.children.push(el);
    else root = el;
    resolveNamespaces(el, pos);
    if (!selfClosing) stack.push(el);
    else if (!parent) {
      const tail = src
        .slice(pos)
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<\?[\s\S]*?\?>/g, "");
      if (tail.trim()) fail("Content after the root element.");
      pos = src.length;
    }
  }

  if (stack.length)
    throw new XmlParseError(
      `Unclosed element <${stack[stack.length - 1].name}>.`,
      pos,
    );
  if (!root) throw new XmlParseError("No root element found.", 0);
  return { root, prolog };
}

function resolveNamespaces(el: RawElement, offset: number) {
  for (const a of el.rawAttrs) {
    if (a.name === "xmlns") el.namespaces.push({ prefix: "", uri: a.value });
    else if (a.name.startsWith("xmlns:")) {
      const p = a.name.slice(6);
      if (!a.value)
        throw new XmlParseError(
          `Namespace prefix "${p}" cannot be undeclared.`,
          offset,
        );
      el.namespaces.push({ prefix: p, uri: a.value });
    }
  }
  const uri = lookupNamespace(el, el.prefix);
  if (uri === undefined)
    throw new XmlParseError(
      `Unbound namespace prefix "${el.prefix}" on <${el.name}>.`,
      offset,
    );
  el.namespaceURI = uri;
  for (const a of el.rawAttrs) {
    if (a.name === "xmlns" || a.name.startsWith("xmlns:")) continue;
    const { prefix, localName } = splitName(a.name);
    let ns = "";
    if (prefix) {
      const u = lookupNamespace(el, prefix);
      if (u === undefined)
        throw new XmlParseError(
          `Unbound namespace prefix "${prefix}" on attribute "${a.name}".`,
          offset,
        );
      ns = u;
    }
    el.attributes.push({
      name: a.name,
      prefix,
      localName,
      namespaceURI: ns,
      value: a.value,
    });
  }
  delete (el as Partial<RawElement>).rawAttrs;
}

/**
 * Resolve a prefix ("" for the default namespace) against the in-scope
 * declarations of `el`. Returns `undefined` for an unbound prefix and "" for
 * no default namespace.
 */
export function lookupNamespace(
  el: XmlElement,
  prefix: string,
): string | undefined {
  if (prefix === "xml") return XML_NS;
  for (let e: XmlElement | null = el; e; e = e.parent) {
    for (const d of e.namespaces) if (d.prefix === prefix) return d.uri;
  }
  return prefix === "" ? "" : undefined;
}

/** All namespace bindings in scope at `el`, nearest declaration winning. */
export function inScopeNamespaces(el: XmlElement): Map<string, string> {
  const chain: XmlElement[] = [];
  for (let e: XmlElement | null = el; e; e = e.parent) chain.unshift(e);
  const map = new Map<string, string>();
  for (const e of chain) for (const d of e.namespaces) map.set(d.prefix, d.uri);
  return map;
}

/* ------------------------------------------------------------------ */
/* Query helpers                                                       */
/* ------------------------------------------------------------------ */

export function childElements(
  el: XmlElement,
  ns?: string,
  localName?: string,
): XmlElement[] {
  const out: XmlElement[] = [];
  for (const c of el.children) {
    if (c.type !== "element") continue;
    if (ns !== undefined && c.namespaceURI !== ns) continue;
    if (localName !== undefined && c.localName !== localName) continue;
    out.push(c);
  }
  return out;
}

export function firstChild(
  el: XmlElement | undefined | null,
  ns: string,
  localName: string,
): XmlElement | undefined {
  if (!el) return undefined;
  return childElements(el, ns, localName)[0];
}

/** Depth-first descendants (excluding `el`) matching ns/localName. */
export function descendants(
  el: XmlElement,
  ns?: string,
  localName?: string,
): XmlElement[] {
  const out: XmlElement[] = [];
  const walk = (e: XmlElement) => {
    for (const c of e.children) {
      if (c.type !== "element") continue;
      if (
        (ns === undefined || c.namespaceURI === ns) &&
        (localName === undefined || c.localName === localName)
      )
        out.push(c);
      walk(c);
    }
  };
  walk(el);
  return out;
}

/** Value of an unqualified (no-namespace) attribute. */
export function attr(
  el: XmlElement | undefined | null,
  localName: string,
  ns = "",
): string | undefined {
  if (!el) return undefined;
  return el.attributes.find(
    (a) => a.localName === localName && a.namespaceURI === ns,
  )?.value;
}

/** Concatenated text content of an element and its descendants. */
export function textContent(el: XmlElement | undefined | null): string {
  if (!el) return "";
  let s = "";
  for (const c of el.children) {
    if (c.type === "text") s += c.value;
    else if (c.type === "element") s += textContent(c);
  }
  return s;
}
