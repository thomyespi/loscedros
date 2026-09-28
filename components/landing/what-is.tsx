import Image from "next/image";
import { BallIcon } from "@/components/brand/icons";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";
import { whatIs } from "@/content/landing";
import { media } from "@/content/media";

export function WhatIs() {
  return (
    <section id="que-es" className="container-page scroll-mt-24 py-20 sm:py-28">
      {/* grid-cols-1 + min-w-0: sin esto, la fila del carrusel ensancha la columna más que la pantalla y todo se recorta. */}
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-8">
          <SectionHeading eyebrow={whatIs.eyebrow} title={whatIs.title} description={whatIs.description} />
          <ol className="fade-x no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 [mask-image:none] sm:[mask-image:none]">
            {whatIs.steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.n}
                delay={i * 0.08}
                className="group w-[78%] shrink-0 snap-start rounded-2xl border border-white/10 bg-pitch p-5 transition-colors hover:border-grass/40 sm:w-auto"
              >
                <span className="font-display text-4xl text-grass/80 transition group-hover:text-grass">{step.n}</span>
                <h3 className="mt-2 text-lg font-bold text-chalk">{step.title}</h3>
                <p className="mt-1 text-sm text-mist">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal className="relative min-w-0" y={40}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src={media.teeShot.src}
              alt={media.teeShot.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
          </div>
          <div className="glass absolute top-5 -left-2 flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 shadow-xl sm:-left-6">
            <BallIcon className="size-9" />
            <div>
              <p className="font-display text-2xl leading-none text-chalk">N° 5</p>
              <p className="text-xs text-mist">pelota de fútbol</p>
            </div>
          </div>
          <div className="glass absolute -right-2 bottom-6 rounded-2xl border border-white/10 px-4 py-3 shadow-xl sm:-right-6">
            <p className="font-display text-4xl leading-none text-grass">53 cm</p>
            <p className="text-xs text-mist">de diámetro tiene el hoyo</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
