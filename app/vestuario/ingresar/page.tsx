import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/logo";
import { LoginForm } from "@/components/admin/login-form";
import { IS_DEMO } from "@/lib/config";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/vestuario/ingresar">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/vestuario") ? sp.next : "/vestuario";
  const forbidden = sp.error === "sin-permiso";

  return (
    <main className="mowed grain flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <LogoMark className="size-16" />
          <h1 className="font-display text-5xl text-chalk">Vestuario</h1>
          <p className="text-sm text-mist">Panel de administración de Los Cedros</p>
        </div>

        {IS_DEMO ? (
          <div className="rounded-2xl border border-cedar/40 bg-cedar/10 p-5 text-sm text-chalk">
            <p className="font-semibold">Modo demo</p>
            <p className="mt-1 text-mist">
              El sitio está usando datos de ejemplo. Para usar el panel, configurá las variables de Supabase
              (<code className="text-cedar-soft">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code className="text-cedar-soft">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) como indica el README.
            </p>
          </div>
        ) : (
          <>
            {forbidden && (
              <p role="alert" className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-chalk">
                Tu usuario no tiene acceso al panel.
              </p>
            )}
            <LoginForm next={next} />
          </>
        )}
      </div>
    </main>
  );
}
