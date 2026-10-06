"use client";

import { useTransition } from "react";

/** Calls a server action with a pending state, so buttons feel instant but never double-fire. */
export function ActionButton({
  action,
  children,
  variant = "primary",
  className = "",
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
  variant?: "primary" | "dark" | "ghost";
  className?: string;
}) {
  const [pending, start] = useTransition();
  const styles = {
    primary: "bg-fleek text-ink hover:bg-fleek-dark",
    dark: "bg-ink text-white hover:bg-ink/85",
    ghost: "bg-white text-ink border border-line hover:border-ink",
  }[variant];
  return (
    <button
      disabled={pending}
      onClick={() => start(() => action())}
      className={`btn-pop rounded-xl border-2 border-ink px-5 py-3 text-sm font-extrabold disabled:opacity-60 ${styles} ${className}`}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
