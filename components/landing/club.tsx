import Image from "next/image";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";
import { club } from "@/content/landing";
import { media } from "@/content/media";

export function Club() {
  return (
    <section id="club" className="relative scroll-mt-24 overflow-hidden bg-pitch py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 size-[28rem] rounded-full bg-cedar/10 blur-3xl" />
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="relative order-2 lg:order-1" y={40}>
          <div className="grid grid-cols-5 gap-3">
            <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-3xl">
              <Image src={media.greenGolden.src} alt={media.greenGolden.alt} fill sizes="(min-width:1024px) 30vw, 60vw" className="object-cover" />
            </div>
            <div className="col-span-2 flex flex-col gap-3 pt-10">
              <div className="relative aspect-square overflow-hidden rounded-3xl">
                <Image src={media.teamGroup.src} alt={media.teamGroup.alt} fill sizes="(min-width:1024px) 20vw, 40vw" className="object-cover" />
              </div>
              <div className="flex aspect-square flex-col justify-end rounded-3xl bg-grass p-4 text-night">
                <span className="font-display text-5xl leading-none">+ fútbol</span>
                <span className="font-display text-5xl leading-none">+ golf</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <SectionHeading eyebrow={club.eyebrow} title={club.title} />
          {club.paragraphs.map((p) => (
            <Reveal key={p.slice(0, 20)}>
              <p className="text-lg text-pretty text-mist">{p}</p>
            </Reveal>
          ))}
          <dl className="mt-2 grid grid-cols-3 gap-3">
            {club.highlights.map((h, i) => (
              <Reveal key={h.label} delay={i * 0.08} className="rounded-2xl border border-white/10 bg-night/50 p-4">
                <dd className="font-display tabular text-4xl text-chalk sm:text-5xl">
                  <CountUp to={h.value} />
                  {h.suffix}
                </dd>
                <dt className="mt-1 text-xs tracking-wide text-mist uppercase">{h.label}</dt>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
