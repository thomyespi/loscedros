/* Piezas compartidas para las imágenes Open Graph (next/og). Solo estilos inline. */

export const OG_SIZE = { width: 1200, height: 630 };

export function OgFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: "radial-gradient(circle at 85% 10%, #2a4a1a 0%, #0e1f16 45%, #07130d 100%)",
        color: "#f2f5ef",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="64" height="64" viewBox="0 0 48 48">
          <path d="M24 3 33.5 15.5H28.5L37 26H31L40 37.5H8L17 26H11L19.5 15.5H14.5Z" fill="#9be22d" />
          <rect x="21.75" y="37.5" width="4.5" height="7" rx="1" fill="#c8894a" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>Los Cedros</span>
          <span style={{ fontSize: 18, letterSpacing: 8, color: "#9be22d", textTransform: "uppercase" }}>Footgolf club</span>
        </div>
      </div>
      {children}
      <div style={{ display: "flex", fontSize: 24, color: "#9db0a3" }}>Malvinas Argentinas · Buenos Aires</div>
    </div>
  );
}
