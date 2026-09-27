import type { NextConfig } from "next";
import { ADMIN_BASE_PATH } from "./lib/admin-path";
import { STORAGE_BUCKETS, STORAGE_PATH } from "./lib/config";

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const buckets = Object.values(STORAGE_BUCKETS).join("|");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 90],
  },
  // Imágenes de Storage: se piden como /storage/<bucket>/<ruta> y se reescriben a Supabase,
  // así el navegador nunca necesita la URL del proyecto.
  async rewrites() {
    if (!supabaseUrl) return [];
    return [
      {
        source: `${STORAGE_PATH}/:bucket(${buckets})/:path*`,
        destination: `${supabaseUrl}/storage/v1/object/public/:bucket/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: `${ADMIN_BASE_PATH}/:path*`,
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        source: ADMIN_BASE_PATH,
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
