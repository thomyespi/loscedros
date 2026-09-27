"use client";

import { House, MapPin, Medal, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/brand/icons";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";
import { isActive } from "./nav-links";

const LEFT = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/torneos", label: "Torneos", icon: Trophy },
];
const RIGHT = [
  { href: "/ranking", label: "Ranking", icon: Medal },
  { href: "/#como-llegar", label: "Llegar", icon: MapPin },
];

/** Barra de navegación inferior tipo app (solo mobile/tablet). */
export function BottomNav({ whatsapp }: { whatsapp: string }) {
  const pathname = usePathname();

  const item = ({ href, label, icon: Icon }: (typeof LEFT)[number]) => {
    const active = isActive(pathname, href);
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
      </Link>
    );
  };

  return (
    <nav
      aria-label="Navegación"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/8 lg:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="mx-auto flex h-[var(--bottom-nav-h)] max-w-lg items-stretch px-2">
        {LEFT.map(item)}
        <div className="flex flex-1 items-start justify-center">
          <a
            href={whatsappUrl(whatsapp, { kind: "reserva" })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Avisá que venís por WhatsApp"
            className="-mt-5 flex size-16 flex-col items-center justify-center rounded-full bg-grass text-night shadow-[0_12px_30px_-8px_rgb(155_226_45/0.7)] ring-4 ring-night transition active:scale-95"
          >
            <WhatsAppIcon className="size-7" />
          </a>
        </div>
        {RIGHT.map(item)}
      </div>
    </nav>
  );
}
