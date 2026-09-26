"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`rounded-xl px-5 py-3 text-sm font-bold transition active:scale-95 ${copied ? "bg-match text-white" : "bg-fleek text-ink hover:bg-fleek-dark"}`}
    >
      {copied ? "Copied ✓" : "Copy message"}
    </button>
  );
}
