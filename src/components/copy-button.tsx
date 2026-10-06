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
      className={`btn-pop rounded-xl border-2 border-ink px-5 py-3 text-sm font-extrabold ${copied ? "bg-match text-white" : "bg-fleek text-ink hover:bg-fleek-dark"}`}
    >
      {copied ? "Copied ✓" : "Copy message"}
    </button>
  );
}
