"use client";

import { useEffect, useState } from "react";

/**
 * Scroll-spy: devuelve el id de la última sección cuyo borde superior pasó el 35% del viewport
 * (o la última sección si se llegó al final de la página). `null` mientras se está arriba de todas.
 */
export function useActiveSection(ids: readonly string[], enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const compute = () => {
      frame = 0;
      const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
      const line = window.innerHeight * 0.35;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      let current: string | null = null;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      if (atBottom && sections.length) current = sections[sections.length - 1].id;
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids, enabled]);

  return enabled ? active : null;
}
