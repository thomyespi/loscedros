import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import type { SiteSettings } from "@/lib/domain/types";
import { formatHours } from "@/lib/hours";
import { formatPhone, instagramUrl, mapsDirectionsUrl } from "@/lib/settings";
import { whatsappUrl } from "@/lib/whatsapp";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="grain relative mt-24 overflow-hidden border-t border-white/8 bg-pitch">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 font-display text-[28vw] leading-none whitespace-nowrap text-white/3 select-none lg:text-[18rem]"
      >
        Los Cedros
      </div>
      <div className="container-page relative grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Logo />
          <p className="max-w-sm text-sm text-mist">
            Footgolf en Malvinas Argentinas. 18 hoyos para jugar con amigos, en familia o por equipos en nuestros torneos.
          </p>
          <div className="flex gap-2">
            <a
              href={instagramUrl(settings.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 text-chalk transition hover:border-grass hover:text-grass"
              aria-label="Instagram"
            >
              <InstagramIcon className="size-5" />
            </a>
            <a
              href={whatsappUrl(settings.whatsapp, { kind: "consulta" })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 text-chalk transition hover:border-whatsapp hover:text-whatsapp"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="size-5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <h3 className="text-xs font-semibold tracking-[0.2em] text-grass uppercase">Visitanos</h3>
          <a
            href={mapsDirectionsUrl(settings.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-2 text-mist transition hover:text-chalk"
          >
            <MapPin className="mt-0.5 size-4 shrink-0 text-cedar" />
            {settings.address}
          </a>
          <p className="flex gap-2 text-mist">
            <Clock className="mt-0.5 size-4 shrink-0 text-cedar" />
            {formatHours(settings.hours)}
          </p>
          <a
            href={whatsappUrl(settings.whatsapp, { kind: "consulta" })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-2 text-mist transition hover:text-chalk"
          >
            <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-cedar" />
            {formatPhone(settings.whatsapp)}
          </a>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <h3 className="text-xs font-semibold tracking-[0.2em] text-grass uppercase">Explorá</h3>
          <Link href="/torneos" className="text-mist transition hover:text-chalk">Torneos</Link>
          <Link href="/ranking" className="text-mist transition hover:text-chalk">Ranking histórico</Link>
          <Link href="/#que-es" className="text-mist transition hover:text-chalk">¿Qué es el footgolf?</Link>
          <Link href="/#preguntas" className="text-mist transition hover:text-chalk">Preguntas frecuentes</Link>
        </div>
      </div>
      <div className="container-page relative flex flex-col gap-4 border-t border-white/8 py-6 text-xs text-mist/70 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Los Cedros Footgolf · Malvinas Argentinas, Buenos Aires</p>
        <a
          href="https://gen12software.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/12 bg-white/3 px-4 text-sm text-mist transition hover:border-grass/60 hover:text-chalk"
        >
          Sitio hecho por <span className="font-semibold text-chalk group-hover:text-grass">Gen12 Software</span>
          <ArrowUpRight className="size-4 text-grass transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </footer>
  );
}
