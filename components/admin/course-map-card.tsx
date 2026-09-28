"use client";

import { ImagePlus, Loader2, Map as MapIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { removeCourseMap, setCourseMap } from "@/app/vestuario/(panel)/club/actions";
import { ACCEPTED_IMAGES, compressPhoto, uploadImage } from "@/lib/admin/image";
import { fail } from "@/lib/admin/result";
import type { CourseMap } from "@/lib/domain/types";
import { mediaUrl } from "@/lib/storage";
import { ConfirmDialog } from "./confirm-dialog";
import { Card, EmptyState, btn } from "./ui";
import { useAdminAction } from "./use-admin-action";

/** Mapa del momento: se guarda al instante (no depende del botón "Guardar" del formulario). */
export function CourseMapCard({ courseMap }: { courseMap: CourseMap | null }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [run, busy] = useAdminAction();
  const [confirm, setConfirm] = useState(false);

  function onFile(file: File | undefined) {
    if (!file) return;
    run(async () => {
      if (!file.type.startsWith("image/")) return fail("Elegí una imagen (JPG, PNG o WebP)");
      // Lado mayor más grande que las fotos para que se lean los números de los hoyos.
      const { blob, width, height } = await compressPhoto(file, 2560, 1.8);
      const path = await uploadImage("media", "club", blob);
      return setCourseMap({ path, width, height });
    }, courseMap ? "Mapa reemplazado" : "Mapa subido");
  }

  return (
    <Card title="Mapa de la cancha">
      <div className="flex flex-col gap-3">
        {courseMap ? (
          <a href={mediaUrl(courseMap.path)!} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-white/10 bg-night">
            <Image
              src={mediaUrl(courseMap.path)!}
              alt="Mapa actual de la cancha"
              width={courseMap.width}
              height={courseMap.height}
              sizes="(min-width: 768px) 720px, 100vw"
              className="h-auto max-h-96 w-full object-contain"
            />
          </a>
        ) : (
          <EmptyState icon={<MapIcon className="size-8 text-grass" />} title="Todavía no hay mapa">
            <p className="text-sm text-mist">Cuando subas uno, se va a ver en la sección «La cancha» y con un atajo en el inicio.</p>
          </EmptyState>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" className={btn.primary} onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            {busy ? "Guardando…" : courseMap ? "Reemplazar mapa" : "Subir mapa"}
          </button>
          {courseMap && (
            <button type="button" className={btn.danger} onClick={() => setConfirm(true)} disabled={busy}>
              <Trash2 className="size-4" /> Quitar
            </button>
          )}
        </div>
        <p className="text-xs text-mist">Se comprime en el celular antes de subir. Al reemplazarlo, el mapa anterior se borra.</p>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_IMAGES}
          className="sr-only"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="¿Quitar el mapa?"
        description="Deja de verse en la página hasta que subas otro."
        confirmLabel="Quitar"
        destructive
        onConfirm={async () => {
          await run(() => removeCourseMap(), "Mapa quitado");
          setConfirm(false);
        }}
      />
    </Card>
  );
}
