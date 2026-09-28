"use client";

import { House, MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/brand/icons";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";
import { LinkPendingBar } from "./link-pending";
import { isActive, isCompetitionPath } from "./nav-links";

const ITEMS = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/torneos", label: "Competencias", icon: Trophy },
  { href: "/#como-llegar", label: "Llegar", icon: MapPin },
];

/** Barra de navegación inferior tipo app (solo mobile/tablet). El ranking se abre desde Competencias. */
export function BottomNav({ whatsapp }: { whatsapp: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/8 lg:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="mx-auto flex h-[var(--bottom-nav-h)] max-w-lg items-stretch px-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          // Competencias cubre torneos, ranking y páginas de equipos (igual que el menú de desktop).
          const active = href === "/torneos" ? isCompetitionPath(pathname) : isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-full min-w-16 flex-1 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors",
                active ? "text-grass" : "text-mist active:text-chalk",
              )}
            >
              <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 1.8} />
              {label}
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-grass" aria-hidden />}
              <LinkPendingBar className="top-0" />
            </Link>
          );
        })}
        <a
          href={whatsappUrl(whatsapp, { kind: "reserva" })}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Avisá que venís por WhatsApp"
          className="flex min-w-16 flex-1 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold text-grass transition active:scale-95"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-grass text-night shadow-[0_8px_20px_-8px_rgb(155_226_45/0.7)]">
            <WhatsAppIcon className="size-5" />
          </span>
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
