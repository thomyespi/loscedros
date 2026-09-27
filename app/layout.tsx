import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import "./globals.css";

const display = Anton({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Los Cedros Footgolf · Malvinas Argentinas",
    template: "%s · Los Cedros Footgolf",
  },
  description:
    "Cancha de footgolf de 18 hoyos en Malvinas Argentinas, Buenos Aires. Vení a jugar con amigos, sumate a los torneos por equipos y seguí la tabla en vivo.",
  applicationName: SITE_NAME,
  keywords: ["footgolf", "foot golf", "Malvinas Argentinas", "Buenos Aires", "torneos", "Los Cedros", "fútbol golf"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE_NAME,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#07130d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`dark ${display.variable} ${body.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
