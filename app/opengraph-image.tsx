import { ImageResponse } from "next/og";
import { OG_SIZE, OgFrame } from "@/lib/og";

export const alt = "Los Cedros Footgolf · 18 hoyos en Malvinas Argentinas";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 110, fontWeight: 900, lineHeight: 1, textTransform: "uppercase" }}>Pateala</span>
          <span style={{ fontSize: 110, fontWeight: 900, lineHeight: 1, textTransform: "uppercase", color: "#9be22d" }}>
            hasta el hoyo
          </span>
          <span style={{ marginTop: 24, fontSize: 32, color: "#c9d6cd" }}>Footgolf · 18 hoyos · Torneos por equipos</span>
        </div>
      </OgFrame>
    ),
    size,
  );
}
