"use client";

import { useState } from "react";

/** Plain <img> so demo, Blob and local preview URLs all work; falls back to a garment placeholder. */
export function Photo({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed)
    return (
      <div className={`flex items-center justify-center bg-cream text-subtle ${className}`} role="img" aria-label={alt}>
        <svg viewBox="0 0 24 24" className="h-1/3 w-1/3" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round">
          <path d="M8 3l-5 3 2 4 2-1v12h10V9l2 1 2-4-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z" />
        </svg>
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setFailed(true)} />;
}
