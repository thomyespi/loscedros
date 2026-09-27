"use client";

import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TeamAvatar } from "@/components/team-avatar";
import type { Team } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { inputClass } from "./ui";

/** Lista tocable de equipos con búsqueda y "seleccionar todos". */
export function TeamMultiSelect({
  teams,
  selected,
  onChange,
}: {
  teams: Pick<Team, "id" | "name" | "avatarPath">[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const set = new Set(selected);
  const visible = useMemo(() => teams.filter((t) => t.name.toLowerCase().includes(q.trim().toLowerCase())), [teams, q]);
  const allVisibleSelected = visible.length > 0 && visible.every((t) => set.has(t.id));

  const toggle = (id: string) => onChange(set.has(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="flex flex-col gap-3">
      {teams.length > 6 && (
        <label className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-mist" />
          <span className="sr-only">Buscar</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar equipo…" className={cn(inputClass, "pl-12")} />
        </label>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="text-mist">
          <b className="text-chalk">{selected.length}</b> seleccionados
        </span>
        <button
          type="button"
          className="font-semibold text-grass"
          onClick={() =>
            onChange(
              allVisibleSelected
                ? selected.filter((id) => !visible.some((t) => t.id === id))
                : [...new Set([...selected, ...visible.map((t) => t.id)])],
            )
          }
        >
          {allVisibleSelected ? "Quitar todos" : "Elegir todos"}
        </button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {visible.map((t) => {
          const on = set.has(t.id);
          return (
            <li key={t.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(t.id)}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3 text-left transition",
                  on ? "border-grass bg-grass/10" : "border-white/10 bg-pitch hover:border-white/25",
                )}
              >
                <TeamAvatar team={t} size="sm" />
                <span className="min-w-0 flex-1 truncate font-medium text-chalk">{t.name}</span>
                <span className={cn("flex size-6 items-center justify-center rounded-full border", on ? "border-grass bg-grass text-night" : "border-white/25")}>
                  {on && <Check className="size-4" strokeWidth={3} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
