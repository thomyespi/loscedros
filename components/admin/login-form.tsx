"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/app/vestuario/ingresar/actions";
import { inputClass } from "./ui";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await signIn({ email, password }).catch(() => null);
    if (!result?.ok) {
      setError(result?.error ?? "No se pudo ingresar. Revisá tu conexión e intentá de nuevo.");
      setPending(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-pitch p-5" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-chalk">Email</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-chalk">Contraseña</span>
        <span className="relative">
          <input
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-mist hover:text-chalk"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </span>
      </label>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !email || !password}
        className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-grass font-semibold text-night transition hover:bg-grass-soft disabled:opacity-50"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Entrar
      </button>
    </form>
  );
}
