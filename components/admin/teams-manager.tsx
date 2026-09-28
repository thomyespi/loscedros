"use client";

import { Archive, ArchiveRestore, ChevronRight, Loader2, Plus, Search, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createTeam,
  deleteTeam,
  renameTeam,
  setTeamArchived,
  setTeamAvatar,
} from "@/app/vestuario/(panel)/equipos/actions";
import { TeamAvatar } from "@/components/team-avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { uploadImage } from "@/lib/admin/image";
import { cn } from "@/lib/utils";
import { AvatarPicker } from "./avatar-picker";
import { ConfirmDialog } from "./confirm-dialog";
import { EmptyState, Field, btn, inputClass } from "./ui";

export interface AdminTeam {
  id: string;
  name: string;
  slug: string;
  avatarPath: string | null;
  archivedAt: string | null;
  tournaments: number;
}

type Filter = "activos" | "archivados" | "todos";

export function TeamsManager({ teams, openNew }: { teams: AdminTeam[]; openNew: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("activos");
  const [editing, setEditing] = useState<AdminTeam | "new" | null>(openNew ? "new" : null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return teams.filter((t) => {
      if (filter === "activos" && t.archivedAt) return false;
      if (filter === "archivados" && !t.archivedAt) return false;
      return !q || t.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q);
    });
  }, [teams, query, filter]);

  const counts = { activos: teams.filter((t) => !t.archivedAt).length, archivados: teams.filter((t) => t.archivedAt).length, todos: teams.length };

  return (
    <>
      <div className="flex flex-col gap-3">
        <label className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-mist" />
          <span className="sr-only">Buscar equipo</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar equipo…"
            className={cn(inputClass, "pl-12")}
          />
        </label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Filtrar equipos">
          {(["activos", "archivados", "todos"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-10 shrink-0 rounded-full border px-4 text-sm font-semibold capitalize transition",
                filter === f ? "border-grass bg-grass text-night" : "border-white/10 text-mist",
              )}
            >
              {f} <span className="opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<Shield className="size-8 text-grass" />} title={teams.length ? "No hay equipos con ese filtro" : "Todavía no hay equipos"}>
          <button type="button" className={btn.primary} onClick={() => setEditing("new")}>
            <Plus className="size-5" /> Crear equipo
          </button>
        </EmptyState>
      ) : (
        <ul className="flex flex-col divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-pitch">
          {visible.map((t) => (
            <li key={t.id}>
              <button type="button" onClick={() => setEditing(t)} className="flex min-h-16 w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-pitch-2">
                <TeamAvatar team={t} size="md" className={cn(t.archivedAt && "opacity-50 grayscale")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-chalk">{t.name}</span>
                  <span className="text-xs text-mist">
                    {t.tournaments} {t.tournaments === 1 ? "torneo" : "torneos"}
                    {t.archivedAt && " · Archivado"}
                  </span>
                </span>
                <ChevronRight className="size-4 text-mist" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Botón flotante de alta (pulgar) */}
      <button
        type="button"
        onClick={() => setEditing("new")}
        className="fixed right-4 bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom)+1rem)] z-30 flex size-14 items-center justify-center rounded-full bg-grass text-night shadow-[0_12px_30px_-8px_rgb(155_226_45/0.7)] lg:bottom-8"
        aria-label="Nuevo equipo"
      >
        <Plus className="size-7" />
      </button>

      <TeamDialog
        key={editing === "new" ? "new" : (editing?.id ?? "none")}
        team={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </>
  );
}

function TeamDialog({ team, onClose, onSaved }: { team: AdminTeam | "new" | null; onClose: () => void; onSaved: () => void }) {
  const isNew = team === "new";
  const current = team && team !== "new" ? team : null;
  const [name, setName] = useState(current?.name ?? "");
  const [avatar, setAvatar] = useState<{ blob: Blob; preview: string } | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Todo lo que guarda corre en una transición: el diálogo queda con el spinner
  // hasta que la lista ya se actualizó (router.refresh) y recién ahí se cierra.
  const [saving, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<"delete" | null>(null);
  const finish = () => startTransition(onSaved);

  useEffect(() => () => {
    if (avatar) URL.revokeObjectURL(avatar.preview);
  }, [avatar]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        let id = current?.id;
        if (isNew) {
          const res = await createTeam({ name });
          if (!res.ok) return setError(res.error);
          id = res.data.id;
        } else if (current && name.trim() !== current.name) {
          const res = await renameTeam(current.id, { name });
          if (!res.ok) return setError(res.error);
        }
        if (id && avatar) {
          const path = await uploadImage("avatars", `teams/${id}`, avatar.blob);
          const res = await setTeamAvatar(id, path);
          if (!res.ok) throw new Error(res.error);
        } else if (id && removeAvatar && current?.avatarPath) {
          const res = await setTeamAvatar(id, null);
          if (!res.ok) throw new Error(res.error);
        }
        toast.success(isNew ? "Equipo creado" : "Cambios guardados");
        finish();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function toggleArchive() {
    if (!current) return;
    startTransition(async () => {
      const res = await setTeamArchived(current.id, !current.archivedAt);
      if (!res.ok) return void toast.error(res.error);
      toast.success(current.archivedAt ? "Equipo restaurado" : "Equipo archivado");
      finish();
    });
  }

  async function remove() {
    if (!current) return;
    const res = await deleteTeam(current.id);
    if (!res.ok) {
      toast.error(res.error);
      setConfirm(null);
      return;
    }
    toast.success("Equipo borrado");
    setConfirm(null);
    finish();
  }

  return (
    <Dialog open={team !== null} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto rounded-3xl border border-white/10 bg-night p-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl text-chalk">{isNew ? "Nuevo equipo" : "Editar equipo"}</DialogTitle>
          <DialogDescription>Nombre y, si querés, una imagen.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex flex-col gap-5">
          <AvatarPicker
            name={name}
            currentPath={removeAvatar ? null : (current?.avatarPath ?? null)}
            preview={avatar?.preview ?? null}
            onChange={(blob, preview) => {
              setAvatar({ blob, preview });
              setRemoveAvatar(false);
            }}
            onRemove={() => {
              setAvatar(null);
              setRemoveAvatar(true);
            }}
          />
          <Field label="Nombre del equipo" htmlFor="team-name" error={error} hint="Entre 2 y 40 caracteres.">
            <input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              autoFocus={isNew}
              autoComplete="off"
              aria-invalid={!!error}
              className={inputClass}
            />
          </Field>
          <button type="submit" className={btn.primary} disabled={saving || name.trim().length < 2}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isNew ? "Crear equipo" : "Guardar cambios"}
          </button>

          {current && (
            <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
              <button type="button" className={btn.secondary} onClick={toggleArchive} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : current.archivedAt ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
                {current.archivedAt ? "Restaurar equipo" : "Archivar equipo"}
              </button>
              {current.tournaments === 0 ? (
                <button type="button" className={btn.danger} onClick={() => setConfirm("delete")} disabled={saving}>
                  <Trash2 className="size-4" /> Borrar definitivamente
                </button>
              ) : (
                <p className="text-xs text-mist">
                  Jugó {current.tournaments} {current.tournaments === 1 ? "torneo" : "torneos"}: no se puede borrar, pero podés archivarlo.
                  Un equipo archivado no aparece para nuevos torneos y conserva su historial.
                </p>
              )}
            </div>
          )}
        </form>
        <ConfirmDialog
          open={confirm === "delete"}
          onOpenChange={(o) => !o && setConfirm(null)}
          title={`¿Borrar "${current?.name}"?`}
          description="Esta acción no se puede deshacer."
          confirmLabel="Borrar"
          destructive
          onConfirm={remove}
        />
      </DialogContent>
    </Dialog>
  );
}
