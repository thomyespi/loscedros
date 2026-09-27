import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminBottomNav, AdminSideNav } from "@/components/admin/admin-nav";
import { Logo, LogoMark } from "@/components/brand/logo";
import { LOGOUT_PATH, requireAdmin } from "@/lib/auth";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";

// El panel siempre se renderiza por request (sesión del admin, nunca caché).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Vestuario", template: "%s · Vestuario" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: LayoutProps<"/vestuario">) {
  const { user } = await requireAdmin();

  const logout = (
    <form action={LOGOUT_PATH} method="post">
      <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm text-mist transition hover:bg-white/5 hover:text-chalk">
        <LogOut className="size-4" /> Salir
      </button>
    </form>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Desktop: barra lateral */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-white/10 bg-pitch p-4 lg:flex">
        <Link href={ADMIN_BASE_PATH} className="px-2 py-1">
          <Logo />
        </Link>
        <AdminSideNav />
        <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4">
          <p className="truncate px-3 text-xs text-mist">{user.email}</p>
          <Link href="/" target="_blank" className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm text-mist hover:bg-white/5 hover:text-chalk">
            <ExternalLink className="size-4" /> Ver sitio
          </Link>
          {logout}
        </div>
      </aside>

      <div className="flex min-w-0 flex-col pb-[calc(var(--bottom-nav-h)+var(--safe-bottom))] lg:pb-0">
        {/* Mobile: header compacto */}
        <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 px-3 lg:hidden">
          <Link href={ADMIN_BASE_PATH} className="flex items-center gap-2">
            <LogoMark className="size-8" />
            <span className="font-display text-xl text-chalk">Vestuario</span>
          </Link>
          <div className="flex items-center">
            <Link href="/" target="_blank" aria-label="Ver sitio" className="inline-flex size-11 items-center justify-center rounded-full text-mist hover:text-chalk">
              <ExternalLink className="size-5" />
            </Link>
            {logout}
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
