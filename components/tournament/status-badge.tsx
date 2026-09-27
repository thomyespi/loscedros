import { STATUS_LABEL, type TournamentStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const STYLES: Record<TournamentStatus, string> = {
  en_curso: "bg-grass text-night",
  proximo: "bg-cedar/20 text-cedar-soft ring-1 ring-cedar/40",
  finalizado: "bg-white/10 text-chalk ring-1 ring-white/15",
  borrador: "bg-white/5 text-mist ring-1 ring-dashed ring-white/20",
};

export function StatusBadge({ status, className }: { status: TournamentStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold tracking-wider uppercase",
        STYLES[status],
        className,
      )}
    >
      {status === "en_curso" && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-night/60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-night" />
        </span>
      )}
      {status === "en_curso" ? "En juego" : STATUS_LABEL[status]}
    </span>
  );
}
