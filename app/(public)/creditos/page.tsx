import type { Metadata } from "next";
import { allCredits } from "@/content/media";

export const metadata: Metadata = {
  title: "Créditos de fotos",
  robots: { index: false },
};

export default function CreditsPage() {
  return (
    <div className="container-page max-w-3xl pt-28 pb-16">
      <h1 className="font-display text-5xl text-chalk">Créditos de fotos</h1>
      <p className="mt-3 text-mist">
        Las imágenes de muestra del sitio provienen de Wikimedia Commons y se usan según sus licencias.
      </p>
      <ul className="mt-8 flex flex-col gap-3">
        {allCredits.map((c) => (
          <li key={c.file} className="rounded-2xl border border-white/10 bg-pitch p-4 text-sm">
            <a href={c.source} target="_blank" rel="noopener noreferrer" className="font-semibold text-chalk hover:text-grass">
              {c.title}
            </a>
            <p className="text-mist">
              Autor: {c.artist} · Licencia: {c.license}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
