"use client";

import imageCompression from "browser-image-compression";
import { STORAGE_BUCKETS } from "@/lib/config";
import { uploadImageAction } from "@/lib/admin/upload";

export interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = src;
  });
}

/** Recorta el área indicada y la devuelve como WebP cuadrado de `size` px. */
export async function cropToWebp(src: string, area: PixelArea, size = 512) {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no permite procesar imágenes");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
  if (!blob) throw new Error("No se pudo procesar la imagen");
  return blob;
}

/** Comprime una foto (lado mayor ≤ maxSide) a WebP y devuelve también sus dimensiones. */
export async function compressPhoto(file: File, maxSide = 1920) {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: maxSide,
    maxSizeMB: 1.2,
    fileType: "image/webp",
    initialQuality: 0.8,
    useWebWorker: true,
  });
  const url = URL.createObjectURL(compressed);
  try {
    const img = await loadImage(url);
    return { blob: compressed as Blob, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp,image/heic,image/heif";

/** Sube un blob al bucket (vía server action, con la sesión del admin) y devuelve la ruta guardada. */
export async function uploadImage(bucket: keyof typeof STORAGE_BUCKETS, folder: string, blob: Blob) {
  const form = new FormData();
  form.set("bucket", bucket);
  form.set("folder", folder);
  form.set("file", new File([blob], "image.webp", { type: "image/webp" }));
  const result = await uploadImageAction(form).catch(() => null);
  if (!result?.ok) throw new Error(result?.error ?? "No se pudo subir la imagen. Revisá tu conexión e intentá de nuevo.");
  return result.data.path;
}
