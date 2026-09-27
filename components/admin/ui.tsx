import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Inputs grandes y cómodos para usar con el pulgar. */
export const inputClass =
  "h-12 w-full rounded-xl border border-white/12 bg-night/60 px-4 text-base text-chalk placeholder:text-mist/60 transition outline-none focus:border-grass focus:ring-3 focus:ring-grass/25 disabled:opacity-60 aria-invalid:border-destructive";

export const textareaClass = cn(inputClass, "h-auto min-h-28 py-3");

export const btn = {
  primary:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-grass px-5 font-semibold text-night transition hover:bg-grass-soft active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 font-semibold text-chalk transition hover:bg-white/10 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  danger:
    "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-destructive/15 px-5 font-semibold text-destructive transition hover:bg-destructive/25 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 font-medium text-mist transition hover:bg-white/5 hover:text-chalk disabled:opacity-50",
  icon: "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-mist transition hover:bg-white/10 hover:text-chalk disabled:opacity-40",
};

export function AdminPage({
  title,
  subtitle,
  back,
  actions,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 sm:py-8">
      <div className="flex flex-col gap-2">
        {back && (
          <Link href={back.href} className="inline-flex w-fit items-center gap-1 text-sm text-mist hover:text-chalk">
            <ArrowLeft className="size-4" /> {back.label}
          </Link>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-4xl text-chalk sm:text-5xl">{title}</h1>
            {subtitle && <div className="mt-1 text-sm text-mist">{subtitle}</div>}
          </div>
          {actions}
        </div>
      </div>
      {children}
    </div>
  );
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-white/10 bg-pitch p-4 sm:p-5", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold tracking-wider text-mist uppercase">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: ReactNode; error?: string | null; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-chalk">
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : hint ? <p className="text-xs text-mist">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center">
      {icon}
      <p className="font-semibold text-chalk">{title}</p>
      {children}
    </div>
  );
}

/** Barra de acciones pegada abajo (encima de la navegación del panel). */
export function StickyActions({ children }: { children: ReactNode }) {
  return (
    <div className="glass sticky bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom))] z-20 -mx-4 mt-2 flex gap-2 border-t border-white/10 px-4 py-3 lg:bottom-0 [&>*]:flex-1">
      {children}
    </div>
  );
}
