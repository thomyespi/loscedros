"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LinkPendingSpinner } from "./link-pending";

const TABS = [
  { href: "/torneos", label: "Torneos" },
  { href: "/ranking", label: "Ranking" },
] as const;

/** Selector Torneos / Ranking (solo mobile: en desktop están en el menú Competencias). */
export function CompetitionTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Competencia" className="grid w-full max-w-xs grid-cols-2 gap-1 rounded-full border border-white/10 bg-night/60 p-1 lg:hidden">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            replace
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-10 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors",
              active ? "bg-grass text-night" : "text-mist active:text-chalk",
            )}
          >
            {tab.label}
            {!active && <LinkPendingSpinner className="absolute right-3 size-3.5" />}
          </Link>
        );
      })}
    </nav>
  );
}
