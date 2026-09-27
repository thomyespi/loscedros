"use client";

import { House, Settings, Shield, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: ADMIN_BASE_PATH, label: "Inicio", icon: House, exact: true },
  { href: `${ADMIN_BASE_PATH}/torneos`, label: "Torneos", icon: Trophy },
  { href: `${ADMIN_BASE_PATH}/equipos`, label: "Equipos", icon: Shield },
  { href: `${ADMIN_BASE_PATH}/club`, label: "Club", icon: Settings },
];

function useActive() {
  const pathname = usePathname();
  return (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
}

/** Navegación inferior (mobile) del panel. */
export function AdminBottomNav() {
  const isActive = useActive();
  return (
    <nav aria-label="Panel" className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/10 lg:hidden" style={{ paddingBottom: "var(--safe-bottom)" }}>
      <ul className="mx-auto flex h-[var(--bottom-nav-h)] max-w-lg">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex h-full flex-col items-center justify-center gap-1 text-[0.7rem] font-medium", active ? "text-grass" : "text-mist")}
              >
                <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Navegación lateral (desktop) del panel. */
export function AdminSideNav() {
  const isActive = useActive();
  return (
    <nav aria-label="Panel" className="flex flex-col gap-1">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
              active ? "bg-grass/10 text-grass" : "text-mist hover:bg-white/5 hover:text-chalk",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
