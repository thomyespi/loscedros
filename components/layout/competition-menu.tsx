"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronDown, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LinkPendingSpinner } from "./link-pending";
import { COMPETITION_LINKS } from "./nav-links";

/** Botón "Competencias" del header: despliega Torneos y Ranking. */
export function CompetitionMenu({ active, pathname }: { active: boolean; pathname: string }) {
  // El menú queda abierto (con el spinner del link tocado) hasta que cambia la ruta.
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <Menu.Root open={open} onOpenChange={setOpen}>
      <Menu.Trigger
        className={cn(
          "group inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm whitespace-nowrap font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-grass/50",
          active
            ? "border-grass/50 bg-grass/10 text-grass"
            : "border-white/15 text-chalk hover:border-white/30 data-[popup-open]:border-white/30",
        )}
      >
        <Trophy className="size-4" />
        Competencias
        <ChevronDown className="size-3.5 transition-transform group-data-[popup-open]:rotate-180" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={10} className="z-50 outline-none">
          <Menu.Popup className="glass min-w-64 origin-[var(--transform-origin)] rounded-2xl border border-white/10 p-1.5 shadow-2xl outline-none transition duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            {COMPETITION_LINKS.map((link) => {
              const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Menu.LinkItem
                  key={link.href}
                  closeOnClick={current}
                  render={<Link href={link.href} />}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex flex-col rounded-xl px-3 py-2.5 outline-none transition-colors data-[highlighted]:bg-white/10",
                    current && "bg-grass/10",
                  )}
                >
                  <span className={cn("flex items-center justify-between gap-2 text-sm font-semibold", current ? "text-grass" : "text-chalk")}>
                    {link.label}
                    <LinkPendingSpinner />
                  </span>
                  <span className="text-xs text-mist">{link.description}</span>
                </Menu.LinkItem>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
