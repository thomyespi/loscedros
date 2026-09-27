import Link from "next/link";
import { BallIcon } from "@/components/brand/icons";

export default function NotFound() {
  return (
    <main className="mowed grain flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="relative">
        <span className="font-display text-[9rem] leading-none text-white/10 sm:text-[14rem]">404</span>
        <BallIcon className="animate-float absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 sm:size-24" />
      </div>
      <h1 className="font-display text-5xl text-chalk">¡Se fue al lago!</h1>
      <p className="max-w-sm text-mist">La página que buscás no existe o ya no está disponible.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full bg-grass px-6 font-semibold text-night">
          Volver al inicio
        </Link>
        <Link href="/torneos" className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 font-semibold text-chalk">
          Ver torneos
        </Link>
      </div>
    </main>
  );
}
