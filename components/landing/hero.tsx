import { ArrowRight, ChevronDown, Map as MapIcon } from "lucide-react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { hero } from "@/content/landing";
import { media } from "@/content/media";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { Spotlight } from "@/lib/data/selectors";

export function Hero({
  whatsapp,
  openingHours,
  spotlight,
  hasCourseMap,
}: {
  whatsapp: string;
  openingHours: string;
  spotlight: Spotlight | null;
  hasCourseMap: boolean;
}) {
  const common = { alt: media.hero.alt, sizes: "100vw" };
  const { props: { srcSet: desktop } } = getImageProps({
    ...common,
    src: media.hero.src,
    width: media.hero.width,
    height: media.hero.height,
    quality: 75,
  });
  const { props: { srcSet: mobile, alt: mobileAlt, ...rest } } = getImageProps({
    ...common,
    src: media.heroMobile.src,
    width: media.heroMobile.width,
    height: media.heroMobile.height,
    quality: 75,
  });

  const live = spotlight && spotlight.kind !== "champion" ? spotlight : null;

  return (
    <section className="relative isolate flex min-h-svh items-end overflow-hidden lg:min-h-[92vh] lg:items-center">
      {/* En desktop la foto ocupa la derecha para que el jugador no quede detrás del texto. */}
      <picture className="absolute inset-0 -z-20 lg:left-[32%]">
        <source media="(min-width: 768px)" srcSet={desktop} />
        <source srcSet={mobile} />
        <img
          alt={mobileAlt}
          {...rest}
          fetchPriority="high"
          loading="eager"
          className="animate-kenburns h-full w-full object-cover object-[50%_30%]"
        />
      </picture>
      {/* Overlays para legibilidad */}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-night via-night/55 to-night/10 lg:via-night/20 lg:to-transparent" aria-hidden />
      <div
        className="absolute inset-y-0 left-[32%] -z-10 w-[16%] -translate-x-px bg-linear-to-r from-night via-night/50 to-transparent max-lg:hidden"
        aria-hidden
      />
      <div className="absolute inset-y-0 left-0 -z-10 w-[32%] bg-night max-lg:hidden" aria-hidden />
      <div className="grain absolute inset-0 -z-10" aria-hidden />

      {/* En desktop el texto se alinea al borde izquierdo (no al contenedor centrado) para dejarle más lugar a la foto. */}
      <div className="container-page pt-28 pb-14 lg:max-w-none lg:px-12 lg:pb-20 xl:px-16">
        <div className="max-w-3xl lg:max-w-[min(46%,44rem)]">
          {live ? (
            <Link
              href={`/torneos/${live.view.tournament.slug}`}
              className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both mb-5 inline-flex items-center gap-2 rounded-full border border-grass/30 bg-night/60 py-1.5 pr-3 pl-2 text-xs font-semibold text-chalk backdrop-blur transition hover:border-grass"
            >
              <span className="relative flex size-2.5">
                <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-grass" />
                <span className="relative inline-flex size-2.5 rounded-full bg-grass" />
              </span>
              {live.kind === "live" ? "En juego:" : "Próximo:"} {live.view.tournament.name}
              <ArrowRight className="size-3.5 text-grass" />
            </Link>
          ) : (
            <p className="animate-in fade-in fill-mode-both mb-5 text-xs font-semibold tracking-[0.3em] text-grass uppercase">
              {hero.eyebrow}
            </p>
          )}

          <h1 className="font-display text-[clamp(4.2rem,21vw,10.5rem)] text-chalk lg:text-[clamp(5rem,8.5vw,9rem)]">
            <span className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both block duration-700">{hero.titleTop}</span>
            <span className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both text-gradient-grass block delay-150 duration-700">
              {hero.titleBottom}
            </span>
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-5 max-w-xl text-lg text-pretty text-chalk/85 delay-300 duration-700 sm:text-xl">
            {hero.subtitle}
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-8 flex flex-col gap-3 delay-500 duration-700 sm:flex-row">
            <Link
              href="/torneos"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-grass px-7 text-base font-semibold text-night shadow-[0_10px_30px_-10px_rgb(155_226_45/0.6)] transition hover:bg-grass-soft active:scale-[0.97]"
            >
              Ver torneos
              <ArrowRight className="size-5" />
            </Link>
            <WhatsAppButton phone={whatsapp} context={{ kind: "reserva" }} variant="outline">
              Avisá que venís
            </WhatsAppButton>
          </div>

          {hasCourseMap && (
            <a
              href="#mapa"
              className="animate-in fade-in fill-mode-both mt-4 inline-flex h-11 items-center gap-2 text-sm font-semibold text-chalk/85 underline-offset-4 transition delay-500 duration-700 hover:text-grass hover:underline"
            >
              <MapIcon className="size-4 text-grass" />
              Ver mapa de la cancha
            </a>
          )}

          {/* En celular "Dónde" va en su propia fila para que "Malvinas Argentinas" entre en una línea. */}
          <dl className="animate-in fade-in fill-mode-both mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-5 delay-700 duration-1000 sm:w-max sm:grid-cols-[auto_auto_auto] sm:gap-x-10 [&_dd]:font-display [&_dd]:text-3xl [&_dd]:whitespace-nowrap [&_dd]:text-chalk lg:[&_dd]:text-2xl xl:[&_dd]:text-3xl">
            <div>
              <dt className="text-[0.65rem] tracking-[0.2em] text-mist uppercase">Hoyos</dt>
              <dd>18</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] tracking-[0.2em] text-mist uppercase">Horario</dt>
              <dd>{compactHours(openingHours)}</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-[0.65rem] tracking-[0.2em] text-mist uppercase">Dónde</dt>
              <dd>Malvinas Argentinas</dd>
            </div>
          </dl>
        </div>
      </div>

      <a
        href="#que-es"
        aria-label="Bajar"
        className="animate-float absolute bottom-10 left-1/2 hidden -translate-x-1/2 text-chalk/70 transition hover:text-grass lg:block"
      >
        <ChevronDown className="size-7" />
      </a>
    </section>
  );
}

/** "Todos los días de 9 a 19 h" → "9–19 h" (si no reconoce el formato, lo deja como está). */
function compactHours(text: string) {
  const m = text.match(/(\d{1,2})(?::\d{2})?\s*(?:a|-|–)\s*(\d{1,2})(?::\d{2})?/);
  return m ? `${m[1]}–${m[2]} h` : text;
}
