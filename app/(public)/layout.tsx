import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSettings } from "@/lib/data/snapshot";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <div className="pb-safe-nav flex min-h-dvh flex-col overflow-x-clip">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-full bg-grass px-4 py-2 text-night focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <SiteHeader whatsapp={settings.whatsapp} instagram={settings.instagram} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <BottomNav whatsapp={settings.whatsapp} />
    </div>
  );
}
