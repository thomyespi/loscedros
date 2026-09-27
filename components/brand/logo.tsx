import { cn } from "@/lib/utils";

/**
 * Logo provisorio: cedro estilizado + pelota. Cuando el club tenga logo definitivo,
 * reemplazá el contenido de <LogoMark/> (o poné un <Image/>) y listo.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("shrink-0", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path
        d="M24 3 33.5 15.5H28.5L37 26H31L40 37.5H8L17 26H11L19.5 15.5H14.5Z"
        fill="var(--color-grass)"
      />
      <path d="M24 3 33.5 15.5H28.5L37 26H31L40 37.5H24Z" fill="var(--color-grass-deep)" opacity=".55" />
      <rect x="21.75" y="37.5" width="4.5" height="7" rx="1" fill="var(--color-cedar)" />
      <circle cx="38.5" cy="40.5" r="6" fill="var(--color-chalk)" />
      <path d="m38.5 37.4 2.9 2.1-1.1 3.4h-3.6l-1.1-3.4Z" fill="var(--color-night)" />
      <path
        d="m38.5 37.4v-2.9m2.9 5 2.7-.9m-3.8 4.3 1.7 2.3m-5.3-2.3-1.7 2.3m.6-5.7-2.7-.9"
        stroke="var(--color-night)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-9" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.35rem] tracking-wide text-chalk">Los Cedros</span>
        {!compact && (
          <span className="mt-0.5 text-[0.6rem] font-semibold tracking-[0.32em] text-grass uppercase">Footgolf club</span>
        )}
      </span>
    </span>
  );
}
