import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { getSnapshot } from "@/lib/data/snapshot";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snap = await getSnapshot();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/torneos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/ranking`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
  const tournaments = snap.tournaments
    .filter((t) => t.status !== "borrador")
    .map((t) => ({
      url: `${SITE_URL}/torneos/${t.slug}`,
      lastModified: now,
      changeFrequency: (t.status === "en_curso" ? "daily" : "monthly") as "daily" | "monthly",
      priority: t.status === "en_curso" ? 0.9 : 0.6,
    }));
  const enrolled = new Set(snap.tournaments.filter((t) => t.status !== "borrador").flatMap((t) => t.teamIds));
  const teams = snap.teams
    .filter((t) => enrolled.has(t.id))
    .map((t) => ({ url: `${SITE_URL}/equipos/${t.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 }));
  return [...staticRoutes, ...tournaments, ...teams];
}
