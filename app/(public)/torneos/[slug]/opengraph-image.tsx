import { ImageResponse } from "next/og";
import { buildTournamentView, findTournament } from "@/lib/data/selectors";
import { getSnapshot } from "@/lib/data/snapshot";
import { OG_SIZE, OgFrame } from "@/lib/og";
import { STATUS_LABEL } from "@/lib/domain/types";

export const alt = "Torneo de footgolf en Los Cedros";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snap = await getSnapshot();
  const t = findTournament(snap, slug);
  const view = t ? buildTournamentView(snap, t) : null;
  const leader = view?.leader ? view.teamById.get(view.leader.teamId) : null;
  const highlight = view?.champion
    ? { label: "Campeón", name: view.champion.name, color: "#f2c94c" }
    : leader && view?.leader
      ? { label: `Líder · ${view.leader.points} pts`, name: leader.name, color: "#9be22d" }
      : null;

  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {t && (
            <span
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "6px 18px",
                borderRadius: 999,
                background: t.status === "en_curso" ? "#9be22d" : "rgba(255,255,255,0.12)",
                color: t.status === "en_curso" ? "#07130d" : "#f2f5ef",
                fontSize: 24,
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              {t.status === "en_curso" ? "En juego" : STATUS_LABEL[t.status]}
            </span>
          )}
          <span style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, textTransform: "uppercase" }}>{t?.name ?? "Torneos"}</span>
          {highlight && (
            <span style={{ display: "flex", gap: 16, fontSize: 40 }}>
              <span style={{ color: highlight.color, fontWeight: 800 }}>{highlight.label}:</span>
              <span>{highlight.name}</span>
            </span>
          )}
        </div>
      </OgFrame>
    ),
    size,
  );
}
