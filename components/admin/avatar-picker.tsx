"use client";

import { Camera, Loader2, Trash2, ZoomIn } from "lucide-react";
import { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import { TeamAvatar } from "@/components/team-avatar";
import { ACCEPTED_IMAGES, cropToWebp, type PixelArea } from "@/lib/admin/image";
import { btn } from "./ui";

/**
 * Elegir foto → recortar cuadrado → WebP 512px (todo en el celular, antes de subir).
 * Devuelve el blob al padre; la subida la hace el formulario al guardar.
 */
export function AvatarPicker({
  name,
  currentPath,
  preview,
  onChange,
  onRemove,
}: {
  name: string;
  currentPath: string | null;
  preview: string | null;
  onChange: (blob: Blob, previewUrl: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<PixelArea | null>(null);
  const [busy, setBusy] = useState(false);

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Elegí una imagen (JPG, PNG o WebP)");
      return;
    }
    setSource(URL.createObjectURL(file));
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  }

  async function confirmCrop() {
    if (!source || !area) return;
    setBusy(true);
    try {
      const blob = await cropToWebp(source, area, 512);
      onChange(blob, URL.createObjectURL(blob));
      URL.revokeObjectURL(source);
      setSource(null);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const hasAvatar = !!preview || !!currentPath;

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview local (blob:)
          <img src={preview} alt="" className="size-20 rounded-full object-cover" />
        ) : (
          <TeamAvatar team={{ name: name || "?", avatarPath: currentPath }} size="xl" />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -right-1 -bottom-1 flex size-9 items-center justify-center rounded-full bg-grass text-night shadow-lg"
          aria-label="Cambiar avatar"
        >
          <Camera className="size-4" />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <button type="button" onClick={() => inputRef.current?.click()} className="text-left text-sm font-semibold text-grass">
          {hasAvatar ? "Cambiar imagen" : "Subir imagen"}
        </button>
        {hasAvatar && (
          <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-left text-sm text-mist hover:text-destructive">
            <Trash2 className="size-3.5" /> Quitar
          </button>
        )}
        <span className="text-xs text-mist">Opcional. Si no hay, se muestran las iniciales.</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGES}
        className="sr-only"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {source && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-night" role="dialog" aria-modal="true" aria-label="Recortar avatar">
          <div className="relative flex-1">
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, px) => setArea(px)}
            />
          </div>
          <div className="flex flex-col gap-4 border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <label className="flex items-center gap-3 text-sm text-mist">
              <ZoomIn className="size-5" />
              <input
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-2 flex-1 accent-[var(--color-grass)]"
                aria-label="Zoom"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={btn.secondary}
                onClick={() => {
                  URL.revokeObjectURL(source);
                  setSource(null);
                }}
              >
                Cancelar
              </button>
              <button type="button" className={btn.primary} onClick={confirmCrop} disabled={busy || !area}>
                {busy && <Loader2 className="size-4 animate-spin" />} Usar imagen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
