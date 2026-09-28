import { describe, expect, it } from "vitest";
import {
  TIME_OPTIONS,
  formatDays,
  formatHours,
  formatHoursShort,
  formatTime,
  openDaysTitle,
  sameHours,
  toOpeningHoursSpec,
  type OpeningHours,
} from "@/lib/hours";

const club: OpeningHours = { days: [3, 4, 5, 6, 7], opens: "10:00", closes: "16:30" };

describe("horario", () => {
  it("miércoles a domingo, de 10 a 16:30", () => {
    expect(formatHours(club)).toBe("Miércoles a domingo, de 10 a 16:30 h");
    expect(formatHoursShort(club)).toBe("10–16:30 h");
    expect(openDaysTitle(club)).toBe("Abierto de miércoles a domingo");
  });

  it("todos los días", () => {
    const h: OpeningHours = { days: [1, 2, 3, 4, 5, 6, 7], opens: "09:00", closes: "19:00" };
    expect(formatHours(h)).toBe("Todos los días, de 9 a 19 h");
    expect(openDaysTitle(h)).toBe("Abierto todos los días");
  });

  it("dos días, días sueltos y un solo día", () => {
    expect(formatDays([7, 6])).toBe("Sábado y domingo");
    expect(openDaysTitle({ ...club, days: [6, 7] })).toBe("Abierto los sábados y domingos");
    expect(formatDays([1, 3, 5])).toBe("Lunes, miércoles y viernes");
    expect(openDaysTitle({ ...club, days: [1, 3, 5] })).toBe("Abierto los lunes, miércoles y viernes");
    expect(formatDays([7])).toBe("Domingo");
  });

  it("rango que cruza el domingo", () => {
    expect(formatDays([1, 5, 6, 7])).toBe("Viernes a lunes");
    expect(formatDays([7, 1])).toBe("Domingo y lunes");
  });

  it("horas en punto y con minutos", () => {
    expect(formatTime("09:00")).toBe("9");
    expect(formatTime("16:30")).toBe("16:30");
    expect(TIME_OPTIONS[0]).toBe("06:00");
    expect(TIME_OPTIONS.at(-1)).toBe("23:30");
  });

  it("compara por valor", () => {
    expect(sameHours(club, { ...club, days: [7, 6, 5, 4, 3] })).toBe(true);
    expect(sameHours(club, { ...club, closes: "17:00" })).toBe(false);
  });

  it("schema.org", () => {
    const spec = toOpeningHoursSpec(club);
    expect(spec.dayOfWeek).toEqual([
      "https://schema.org/Wednesday",
      "https://schema.org/Thursday",
      "https://schema.org/Friday",
      "https://schema.org/Saturday",
      "https://schema.org/Sunday",
    ]);
    expect(spec.opens).toBe("10:00");
    expect(spec.closes).toBe("16:30");
  });
});
