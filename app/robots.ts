import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

// No se menciona la ruta del panel: listarla la delataría. El panel se protege
// con login + RLS y responde con X-Robots-Tag: noindex (ver next.config.ts).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
