"use client";

import { ExternalLink, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";

const ALT = "Mapa actual de la cancha de Los Cedros";

/** Mapa del momento (lo sube el admin) con visor a pantalla completa. */
export function CourseMap({ src, width, height }: { src: string; width: number; height: number }) {
  const [open, setOpen] = useState(false);

  return (
    // Vista compacta (el detalle se ve con "Ver en grande"): en desktop, texto a la izquierda y mapa a la derecha.
    <div id="mapa" className="mt-6 grid scroll-mt-24 items-center gap-5 rounded-3xl border border-white/10 bg-pitch p-5 sm:p-6 lg:grid-cols-[1fr_1.4fr] lg:gap-8">
      <div className="flex flex-col items-start gap-3">
        <p className="text-xs font-semibold tracking-[0.3em] text-grass uppercase">Recorrido vigente</p>
        <h3 className="font-display text-4xl text-chalk sm:text-5xl">Mapa de la cancha</h3>
        <p className="text-pretty text-mist">El recorrido de los 18 hoyos como está hoy. Abrilo en grande para ver el detalle.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-chalk transition hover:border-grass hover:text-grass"
        >
          <Maximize2 className="size-4" /> Ver en grande
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver el mapa en grande"
        className="flex w-full justify-center overflow-hidden rounded-2xl bg-night/60 p-2 focus-visible:ring-3 focus-visible:ring-grass/60 focus-visible:outline-none"
      >
        <Image
          src={src}
          alt={ALT}
          width={width}
          height={height}
          sizes="(min-width: 1024px) 640px, 100vw"
          className="h-auto max-h-72 w-auto max-w-full rounded-xl object-contain sm:max-h-80 lg:max-h-96"
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="inset-0 top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none bg-night/95 p-0 ring-0 sm:max-w-none"
        >
          <div className="flex items-center gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <DialogTitle className="px-2 text-sm font-semibold text-chalk">Mapa de la cancha</DialogTitle>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-xs text-mist transition hover:text-chalk"
            >
              <ExternalLink className="size-3.5" /> Abrir imagen
            </a>
            <DialogClose
              className="ml-auto flex size-12 items-center justify-center rounded-full text-chalk hover:bg-white/10"
              aria-label="Cerrar"
            >
              <X className="size-6" />
            </DialogClose>
          </div>
          <div className="relative flex-1">
            <Image src={src} alt={ALT} fill sizes="100vw" className="object-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
