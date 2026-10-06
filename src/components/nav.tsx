"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/orders", label: "Orders", icon: "M4 7h16M4 12h16M4 17h10" },
  { href: "/disputes", label: "Disputes", icon: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" },
  { href: "/pitch", label: "Pitch", icon: "M4 19V5m0 14h16M8 15l3-4 3 2 4-6" },
];

export function Nav() {
  const path = usePathname();
  const active = (href: string) => path === href || (href === "/orders" && path.startsWith("/order"));
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4 sm:px-6">
          <Link href="/orders" className="flex items-center gap-2.5" aria-label="Second Look home">
            <Image src="/brand/fleek-logo.webp" alt="Fleek" width={78} height={25} priority />
            <span className="-rotate-2 rounded-lg border-2 border-ink bg-pink px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[11px] font-bold uppercase text-white shadow-[2px_2px_0_0_#0f0f0f]">
              ✦ Second Look
            </span>
          </Link>
          <nav className="ml-auto hidden gap-1 sm:flex">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-full px-4 py-2 text-sm font-bold transition duration-200 ${active(t.href) ? "bg-fleek text-ink shadow-[2px_2px_0_0_#0f0f0f]" : "text-muted hover:bg-fleek-soft hover:text-ink"}`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {/* Mobile tab bar, mirroring the Fleek app */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="grid grid-cols-3">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${active(t.href) ? "text-ink" : "text-subtle"}`}>
              {active(t.href) && <span className="absolute top-0 h-[3px] w-10 rounded-b bg-fleek" />}
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon} />
              </svg>
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
