import { useMemo, useState } from "react";

import type { XmlToken, XmlTokenKind } from "./core/index.ts";
import { Card, CopyIconBtn, IconBtn } from "./ui";

const TOKEN_CLS: Record<XmlTokenKind, string> = {
  punct: "text-gray-500",
  tag: "text-p2blue-400",
  attr: "text-secondary-400",
  ns: "text-gray-500",
  value: "text-green-300",
  text: "text-white",
  comment: "italic text-gray-500",
  pi: "text-gray-500",
  space: "",
};

/** Syntax-highlighted, pretty-printed XML with copy buttons. */
export default function XmlView({
  tokens,
  rawXml,
}: {
  tokens: XmlToken[];
  rawXml: string;
}) {
  const [open, setOpen] = useState(true);
  const pretty = useMemo(() => tokens.map((t) => t.text).join(""), [tokens]);
  return (
    <Card
      title="Decoded XML"
      actions={
        <>
          <CopyIconBtn value={pretty} label="pretty-printed XML" />
          <IconBtn
            icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
            label={open ? "Collapse" : "Expand"}
            onClick={() => setOpen((o) => !o)}
          />
        </>
      }
    >
      {open && (
        <>
          <pre className="m-0 max-h-[36rem] overflow-auto whitespace-pre-wrap break-all rounded bg-black/30 p-3 font-mono text-xs leading-relaxed">
            {tokens.map((t, i) =>
              t.kind === "space" ? (
                t.text
              ) : (
                <span key={i} className={TOKEN_CLS[t.kind]}>
                  {t.text}
                </span>
              ),
            )}
          </pre>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span>
              Reformatted for reading. Signatures are checked against the
              original message.
            </span>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(rawXml)}
              className="rounded-md border border-white/10 px-2 py-0.5 text-gray-300 hover:bg-white/5"
            >
              Copy original XML
            </button>
          </div>
        </>
      )}
    </Card>
  );
}
