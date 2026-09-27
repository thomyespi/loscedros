"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { instagramUrl } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";
import { NAV_LINKS, isActive } from "./nav-links";

export function SiteHeader({ whatsapp, instagram }: { whatsapp: string; instagram: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

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
        <Link href="/" aria-label="Los Cedros Footgolf, inicio" className="rounded-lg focus-visible:ring-3 focus-visible:ring-grass/50 focus-visible:outline-none">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive(pathname, link.href) ? "bg-white/10 text-chalk" : "text-mist hover:text-chalk",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
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
            className="hidden h-11 items-center gap-2 rounded-full bg-grass px-5 text-sm font-semibold text-night transition hover:bg-grass-soft active:scale-[0.97] lg:inline-flex"
          >
            <WhatsAppIcon className="size-4" />
            Avisá que venís
          </a>
        </div>
      </div>
    </header>
  );
}
