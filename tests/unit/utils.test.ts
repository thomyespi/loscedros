import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/slug";
import { whatsappUrl } from "@/lib/whatsapp";
import { formatRange, todayISO, daysUntil } from "@/lib/dates";
import { initials, avatarGradient } from "@/lib/avatar";
import { roundDatesSchema, settingsSchema, teamSchema } from "@/lib/validation";
import { formatPhone } from "@/lib/settings";

describe("slug", () => {
  it("normaliza acentos, ñ y símbolos", () => {
    expect(slugify("Los Pibes del Hoyo 9!")).toBe("los-pibes-del-hoyo-9");
    expect(slugify("  Año Niño Ñandú  ")).toBe("ano-nino-nandu");
  });
  it("evita colisiones", () => {
    expect(uniqueSlug("Cedros FC", ["cedros-fc", "cedros-fc-2"])).toBe("cedros-fc-3");
  });
});

describe("whatsapp", () => {
  it("arma el link con el mensaje del torneo", () => {
    const url = whatsappUrl("+54 9 11 3956-7637", { kind: "torneo", tournamentName: "Apertura 2026" });
    expect(url.startsWith("https://wa.me/5491139567637?text=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Apertura 2026");
  });
  it("formatea el teléfono", () => {
    expect(formatPhone("5491139567637")).toBe("+54 9 11 3956-7637");
  });
});

describe("dates", () => {
  it("usa el día de Buenos Aires", () => {
    // 02:00 UTC del 27/09 = 23:00 del 26/09 en Buenos Aires
    expect(todayISO(new Date("2026-09-27T02:00:00Z"))).toBe("2026-09-26");
  });
  it("rango compacto", () => {
    expect(formatRange("2026-12-05", "2026-12-19")).toBe("5 – 19 dic 2026");
    expect(formatRange("2026-03-14", "2026-05-23")).toBe("14 mar – 23 may 2026");
  });
  it("días hasta", () => {
    expect(daysUntil("2026-10-10", "2026-09-26")).toBe(14);
  });
});

describe("avatar", () => {
  it("iniciales ignoran palabras de relleno", () => {
    expect(initials("Los Pibes del Hoyo 9")).toBe("PH");
    expect(initials("Cedros FC")).toBe("CE");
    expect(initials("Eagle Norte")).toBe("EN");
  });
  it("color determinístico", () => {
    expect(avatarGradient("Cedros FC")).toBe(avatarGradient("cedros fc"));
  });
});

describe("validación", () => {
  it("nombre de equipo", () => {
    expect(teamSchema.safeParse({ name: " A " }).success).toBe(false);
    expect(teamSchema.safeParse({ name: "Cedros FC" }).success).toBe(true);
  });
  it("fechas en orden", () => {
    expect(roundDatesSchema.safeParse(["2026-10-10", "2026-10-03"]).success).toBe(false);
    expect(roundDatesSchema.safeParse(["2026-10-03", "2026-10-03", "2026-10-10"]).success).toBe(true);
  });
  it("settings normaliza whatsapp e instagram", () => {
    const r = settingsSchema.safeParse({
      openingHours: "Todos los días de 9 a 19 h",
      whatsapp: "+54 9 11 3956-7637",
      instagram: "@los_cedros_footgolf",
      address: "César Bacle 1500",
    });
    expect(r.success && r.data.whatsapp).toBe("5491139567637");
    expect(r.success && r.data.instagram).toBe("los_cedros_footgolf");
    expect(settingsSchema.safeParse({ openingHours: "x9", whatsapp: "11-abc", instagram: "x", address: "abcde" }).success).toBe(false);
  });
});
