import { Check } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/section-heading";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { events } from "@/content/landing";
import { media } from "@/content/media";

export function Events({ whatsapp }: { whatsapp: string }) {
  return (
    <section id="eventos" className="container-page scroll-mt-24 py-10 sm:py-16">
      <Reveal className="relative isolate overflow-hidden rounded-3xl" y={40}>
        <Image src={media.teamFlag.src} alt={media.teamFlag.alt} fill sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/85 to-night/40 sm:bg-gradient-to-r" />
        <div className="flex min-h-[32rem] flex-col justify-end gap-5 p-6 sm:max-w-xl sm:justify-center sm:p-12">
          <Eyebrow>{events.eyebrow}</Eyebrow>
          <h2 className="font-display text-5xl text-chalk sm:text-6xl">{events.title}</h2>
          <p className="text-lg text-chalk/80">{events.description}</p>
          <ul className="flex flex-wrap gap-2">
            {events.items.map((item) => (
              <li key={item} className="glass inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-chalk">
                <Check className="size-3.5 text-grass" /> {item}
              </li>
            ))}
          </ul>
          <WhatsAppButton phone={whatsapp} context={{ kind: "eventos" }} className="mt-2 sm:self-start">
            Armemos tu evento
          </WhatsAppButton>
        </div>
      </Reveal>
    </section>
  );
}
