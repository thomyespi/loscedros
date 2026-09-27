import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";
import { modalities, scoring } from "@/content/landing";

export function Modalities() {
  return (
    <section id="modalidades" className="grain relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-night via-pitch to-night py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Modalidades de torneo"
          title={
            <>
              Tres batallas, <span className="text-gradient-grass">un cruce</span>
            </>
          }
          description="En cada fecha los equipos se enfrentan en las tres modalidades. Así se juegan:"
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {modalities.map((m, i) => (
            <Reveal
              key={m.id}
              delay={i * 0.1}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-pitch-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-grass/50"
            >
              <span
                aria-hidden
                className="font-display pointer-events-none absolute -right-3 -bottom-8 text-[9rem] leading-none text-white/[0.04] transition group-hover:text-grass/10"
              >
                0{i + 1}
              </span>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-grass/10 px-3 py-1 text-xs font-semibold tracking-wide text-grass uppercase">{m.tag}</span>
                <span className="font-display text-2xl text-cedar">{m.players}</span>
              </div>
              <h3 className="font-display mt-6 text-5xl text-chalk">{m.name}</h3>
              <p className="relative mt-3 text-mist">{m.text}</p>
              <p className="relative mt-6 flex items-baseline gap-1 border-t border-white/10 pt-4 text-sm text-mist">
                <span className="font-display text-3xl text-grass">+3</span> puntos para el ganador
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-6 flex flex-col gap-4 rounded-3xl border border-grass/30 bg-grass/5 p-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex items-center gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="font-display flex size-14 items-center justify-center rounded-2xl bg-grass text-2xl text-night">
                3
              </span>
            ))}
            <span className="font-display ml-1 text-3xl text-chalk">= 9</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-chalk">{scoring.title}</h3>
            <p className="text-mist">{scoring.text}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
