import { Clock, MapPin, Navigation } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { SiteSettings } from "@/lib/domain/types";
import { mapsDirectionsUrl, mapsEmbedUrl } from "@/lib/settings";

export function Location({ settings }: { settings: SiteSettings }) {
  return (
    <section id="como-llegar" className="container-page scroll-mt-24 py-20 sm:py-28">
      <SectionHeading eyebrow="Cómo llegar" title="Te esperamos en la cancha" />
      <Reveal className="mt-10 grid overflow-hidden rounded-3xl border border-white/10 bg-pitch lg:grid-cols-5" y={40}>
        <div className="relative aspect-square sm:aspect-[16/10] lg:col-span-3 lg:aspect-auto lg:min-h-[26rem]">
          <iframe
            title="Mapa de Los Cedros Footgolf"
            src={mapsEmbedUrl(settings.address)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 size-full grayscale-[0.4] invert-[0.9] hue-rotate-180 contrast-[0.9]"
          />
        </div>
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:col-span-2">
          <div className="flex gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-grass/10 text-grass">
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="text-xs tracking-widest text-mist uppercase">Dirección</p>
              <p className="text-lg font-semibold text-chalk">{settings.address}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-grass/10 text-grass">
              <Clock className="size-5" />
            </span>
            <div>
              <p className="text-xs tracking-widest text-mist uppercase">Horarios</p>
              <p className="text-lg font-semibold text-chalk">{settings.openingHours}</p>
            </div>
          </div>
          <div className="mt-auto flex flex-col gap-3">
            <a
              href={mapsDirectionsUrl(settings.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-grass px-6 font-semibold text-night transition hover:bg-grass-soft active:scale-[0.97]"
            >
              <Navigation className="size-5" /> Cómo llegar
            </a>
            <WhatsAppButton phone={settings.whatsapp} context={{ kind: "reserva" }} variant="outline">
              Avisá que venís
            </WhatsAppButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
