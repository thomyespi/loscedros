"use client";

import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { btn, inputClass } from "./ui";

/**
 * Confirmación reutilizable. Con `typeToConfirm`, el botón se habilita recién
 * cuando el admin escribe exactamente ese texto (p. ej. el nombre del torneo).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  destructive = false,
  typeToConfirm,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  typeToConfirm?: string;
  onConfirm: () => Promise<void> | void;
}) {
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const canConfirm = !typeToConfirm || typed.trim() === typeToConfirm.trim();

  async function handle() {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
      setTyped("");
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!pending) {
          onOpenChange(o);
          if (!o) setTyped("");
        }
      }}
    >
      <AlertDialogContent className="max-w-[calc(100%-2rem)] gap-5 rounded-3xl border border-white/10 bg-pitch p-5 sm:max-w-md">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="text-xl font-bold text-chalk">{title}</AlertDialogTitle>
          {description && <AlertDialogDescription className="text-mist">{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {typeToConfirm && (
          <label className="flex flex-col gap-1.5 text-sm text-mist">
            Escribí <b className="text-chalk">{typeToConfirm}</b> para confirmar
            <input value={typed} onChange={(e) => setTyped(e.target.value)} className={inputClass} autoComplete="off" />
          </label>
        )}
        <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className={btn.secondary} onClick={() => onOpenChange(false)} disabled={pending}>
            Cancelar
          </button>
          <button
            type="button"
            className={cn(destructive ? btn.danger : btn.primary)}
            onClick={handle}
            disabled={!canConfirm || pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
