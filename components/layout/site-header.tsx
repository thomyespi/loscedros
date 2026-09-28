"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { instagramUrl } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";
import { CompetitionMenu } from "./competition-menu";
import { LinkPendingBar } from "./link-pending";
import { COMPETITION_SECTION, NAV_LINKS, isCompetitionPath } from "./nav-links";
import { useActiveSection } from "./use-active-section";

const SPY_IDS = [...NAV_LINKS.flatMap((l) => (l.section ? [l.section] : [])), COMPETITION_SECTION];

export function SiteHeader({ whatsapp, instagram }: { whatsapp: string; instagram: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const activeSection = useActiveSection(SPY_IDS, isHome);
  const competitionActive = isHome ? activeSection === COMPETITION_SECTION : isCompetitionPath(pathname);

  /** En la home, el link de la sección visible (Inicio arriba de todo). Fuera de la home no se resalta ninguno. */
  const linkActive = (section: string | null) => {
    if (!isHome || competitionActive) return false;
    return section === activeSection;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "glass border-b border-white/8 py-2" : "bg-gradient-to-b from-night/80 to-transparent py-3 lg:py-5",
      )}
    >
      <div className="container-page flex items-center justify-between gap-4">
        <Link href="/" aria-label="Los Cedros Footgolf, inicio" className="shrink-0 rounded-lg focus-visible:ring-3 focus-visible:ring-grass/50 focus-visible:outline-none">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden shrink-0 items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = linkActive(link.section);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  // En lg no entra todo: el logo ya lleva al inicio.
                  link.section === null && "hidden xl:block",
                  active ? "bg-white/10 text-chalk" : "text-mist hover:text-chalk",
                )}
              >
                {link.label}
                <LinkPendingBar className="bottom-0.5 left-1/2 w-6 -translate-x-1/2" />
              </Link>
            );
          })}
          <span className="mx-2 h-5 w-px bg-white/15" aria-hidden />
          <CompetitionMenu active={competitionActive} pathname={pathname} />
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={instagramUrl(instagram)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Los Cedros"
            className="inline-flex size-11 items-center justify-center rounded-full text-chalk transition-colors hover:bg-white/10"
          >
            <InstagramIcon className="size-5" />
          </a>
          <a
            href={whatsappUrl(whatsapp, { kind: "reserva" })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Avisá que venís por WhatsApp"
            className="hidden size-11 items-center justify-center gap-2 rounded-full bg-grass text-sm font-semibold text-night transition hover:bg-grass-soft active:scale-[0.97] lg:inline-flex xl:w-auto xl:px-5"
          >
            <WhatsAppIcon className="size-4" />
            <span className="hidden xl:inline">Avisá que venís</span>
          </a>
        </div>
      </div>
    </header>
  );
}
