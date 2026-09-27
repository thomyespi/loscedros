"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export interface GalleryPhoto {
  id: string;
  src: string;
  caption: string | null;
  label: string | null;
}

/** Grilla de fotos + visor a pantalla completa con swipe y teclado. */
export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(0);
  const reduce = useReducedMotion();

  const go = useCallback(
    (delta: number) => {
      setDir(delta);
      setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length));
    },
    [photos.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, go]);

  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => {
                setDir(0);
                setIndex(i);
              }}
              className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-pitch focus-visible:ring-3 focus-visible:ring-grass/60 focus-visible:outline-none"
              aria-label={p.caption ? `Ver foto: ${p.caption}` : `Ver foto ${i + 1}`}
            >
              <Image src={p.src} alt={p.caption ?? ""} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
              {p.label && (
                <span className="absolute bottom-2 left-2 rounded-full bg-night/70 px-2 py-0.5 text-[0.65rem] font-semibold text-chalk backdrop-blur">
                  {p.label}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Visor de fotos"
            className="fixed inset-0 z-[60] flex flex-col bg-night/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <span className="tabular px-2 text-sm text-mist">
                {index! + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={() => setIndex(null)}
                className="flex size-12 items-center justify-center rounded-full text-chalk hover:bg-white/10"
                aria-label="Cerrar"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.div
                  key={current.id}
                  custom={dir}
                  className="absolute inset-0 touch-pan-y"
                  initial={reduce ? { opacity: 0 } : { x: dir >= 0 ? "100%" : "-100%", opacity: 0.4 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { x: dir >= 0 ? "-100%" : "100%", opacity: 0.4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 34 }}
                  drag={photos.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
                    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
                  }}
                >
                  <Image src={current.src} alt={current.caption ?? ""} fill sizes="100vw" className="pointer-events-none object-contain select-none" />
                </motion.div>
              </AnimatePresence>

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    className="absolute top-1/2 left-3 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-night/60 text-chalk hover:bg-night sm:flex"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="absolute top-1/2 right-3 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-night/60 text-chalk hover:bg-night sm:flex"
                    aria-label="Foto siguiente"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>

            <div className="min-h-16 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
              {current.label && <p className="text-xs font-semibold tracking-widest text-grass uppercase">{current.label}</p>}
              {current.caption && <p className="mt-1 text-chalk">{current.caption}</p>}
              {photos.length > 1 && <p className="mt-1 text-xs text-mist sm:hidden">Deslizá para ver más</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
