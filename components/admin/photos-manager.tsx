"use client";

import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { addPhotos, deletePhoto, movePhoto, setPhotoAsCover, updatePhoto } from "@/app/vestuario/(panel)/torneos/[id]/fotos/actions";
import { ACCEPTED_IMAGES, compressPhoto, uploadImage } from "@/lib/admin/image";
import { mediaUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";
import { Card, EmptyState, btn, inputClass } from "./ui";
import { useAdminAction } from "./use-admin-action";

export interface AdminPhoto {
  id: string;
  path: string;
  caption: string | null;
  roundId: string | null;
}

export function PhotosManager({
  tournamentId,
  coverPath,
  rounds,
  photos,
}: {
  tournamentId: string;
  coverPath: string | null;
  rounds: { id: string; number: number }[];
  photos: AdminPhoto[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [roundId, setRoundId] = useState<string>("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [refreshing, startTransition] = useTransition();
  const busy = !!progress || refreshing;

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 40);
    if (!list.length) return toast.error("Elegí imágenes (JPG, PNG o WebP)");
    setProgress({ done: 0, total: list.length });
    const uploaded: { path: string; width: number; height: number }[] = [];
    let failed = 0;
    for (const file of list) {
      try {
        const { blob, width, height } = await compressPhoto(file, 1920);
        const path = await uploadImage("media", `tournaments/${tournamentId}`, blob);
        uploaded.push({ path, width, height });
      } catch {
        failed++;
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    if (uploaded.length) {
      const res = await addPhotos(tournamentId, roundId || null, uploaded);
      if (!res.ok) toast.error(res.error);
      else toast.success(`${uploaded.length} ${uploaded.length === 1 ? "foto subida" : "fotos subidas"}`);
    }
    if (failed) toast.error(`${failed} ${failed === 1 ? "foto no se pudo subir" : "fotos no se pudieron subir"}`);
    // El botón sigue ocupado hasta que las fotos nuevas ya se ven en la lista.
    startTransition(() => {
      setProgress(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card title="Subir fotos">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-chalk">
            ¿De qué fecha son? (opcional)
            <select value={roundId} onChange={(e) => setRoundId(e.target.value)} className={inputClass}>
              <option value="">Del torneo en general</option>
              {rounds.map((r) => (
                <option key={r.id} value={r.id}>
                  Fecha {r.number}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={btn.primary} onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            {progress ? `Subiendo ${progress.done}/${progress.total}…` : refreshing ? "Actualizando…" : "Elegir fotos"}
          </button>
          {progress && (
            <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={progress.done} aria-valuemax={progress.total}>
              <div className="h-full bg-grass transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
          )}
          <p className="text-xs text-mist">Se comprimen en el celular antes de subir (hasta 40 por vez).</p>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_IMAGES}
            multiple
            className="sr-only"
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </Card>

      {photos.length === 0 ? (
        <EmptyState icon={<ImagePlus className="size-8 text-grass" />} title="Todavía no hay fotos">
          <p className="text-sm text-mist">Las fotos son opcionales. Si no subís ninguna, la pestaña Fotos no aparece en el sitio.</p>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {photos.map((p, i) => (
            <PhotoRow
              key={`${p.id}:${p.caption ?? ""}:${p.roundId ?? ""}`}
              photo={p}
              tournamentId={tournamentId}
              rounds={rounds}
              isCover={coverPath === p.path}
              first={i === 0}
              last={i === photos.length - 1}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function PhotoRow({
  photo,
  tournamentId,
  rounds,
  isCover,
  first,
  last,
}: {
  photo: AdminPhoto;
  tournamentId: string;
  rounds: { id: string; number: number }[];
  isCover: boolean;
  first: boolean;
  last: boolean;
}) {
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [run, busy] = useAdminAction();
  const [confirm, setConfirm] = useState(false);

  return (
    <li className="flex gap-3 rounded-2xl border border-white/10 bg-pitch p-3">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl sm:size-28">
        <Image src={mediaUrl(photo.path)!} alt={photo.caption ?? ""} fill sizes="112px" className="object-cover" />
        {isCover && (
          <span className="absolute top-1 left-1 inline-flex items-center gap-1 rounded-full bg-gold px-1.5 py-0.5 text-[0.6rem] font-bold text-night">
            <Star className="size-3" /> Portada
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => caption.trim() !== (photo.caption ?? "") && run(() => updatePhoto(photo.id, { caption }), "Epígrafe guardado")}
          maxLength={140}
          placeholder="Epígrafe (opcional)"
          className="h-10 rounded-lg border border-white/10 bg-night/40 px-3 text-sm text-chalk placeholder:text-mist/60 outline-none focus:border-grass"
          aria-label="Epígrafe"
        />
        <select
          value={photo.roundId ?? ""}
          onChange={(e) => run(() => updatePhoto(photo.id, { caption, roundId: e.target.value || null }), "Fecha actualizada")}
          className="h-10 rounded-lg border border-white/10 bg-night/40 px-2 text-sm text-chalk outline-none focus:border-grass"
          aria-label="Fecha de la foto"
        >
          <option value="">Torneo en general</option>
          {rounds.map((r) => (
            <option key={r.id} value={r.id}>
              Fecha {r.number}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" className={cn(btn.icon, "size-10")} disabled={busy || first} onClick={() => run(() => movePhoto(tournamentId, photo.id, -1))} aria-label="Subir en el orden">
            <ArrowUp className="size-4" />
          </button>
          <button type="button" className={cn(btn.icon, "size-10")} disabled={busy || last} onClick={() => run(() => movePhoto(tournamentId, photo.id, 1))} aria-label="Bajar en el orden">
            <ArrowDown className="size-4" />
          </button>
          {!isCover && (
            <button type="button" className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold text-gold hover:bg-gold/10" disabled={busy} onClick={() => run(() => setPhotoAsCover(tournamentId, photo.id), "Portada actualizada")}>
              <Star className="size-3.5" /> Portada
            </button>
          )}
          <button type="button" className={cn(btn.icon, "ml-auto size-10 hover:text-destructive")} disabled={busy} onClick={() => setConfirm(true)} aria-label="Borrar foto">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="¿Borrar la foto?"
        description={isCover ? "Es la portada del torneo: el torneo se queda sin portada." : undefined}
        confirmLabel="Borrar"
        destructive
        onConfirm={async () => {
          await run(() => deletePhoto(tournamentId, photo.id), "Foto borrada");
          setConfirm(false);
        }}
      />
    </li>
  );
}
