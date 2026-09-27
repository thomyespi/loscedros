const WORDS = ["Footgolf", "18 hoyos", "Torneos por equipos", "Individual", "Four Ball", "Foursome", "Malvinas Argentinas"];

/** Banda deportiva que se desplaza. */
export function Marquee() {
  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden>
      {WORDS.map((w) => (
        <span key={w} className="flex items-center gap-8">
          <span className="font-display text-2xl text-night sm:text-3xl">{w}</span>
          <span className="size-2 rotate-45 bg-night" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative -mt-3 -rotate-1 overflow-hidden bg-grass py-3 shadow-[0_20px_40px_-20px_rgb(155_226_45/0.5)]">
      <p className="sr-only">{WORDS.join(" · ")}</p>
      <div className="animate-marquee flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}
