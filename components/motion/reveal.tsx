"use client";

import { motion, useReducedMotion } from "motion/react";
import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};

/**
 * Aparición suave al entrar en pantalla. Respeta "reducir movimiento".
 * El HTML del servidor sale con opacity 0; hasta que hidrata lleva `reveal-failsafe`,
 * que lo muestra igual a los pocos segundos si el JS nunca llega a cargar.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "span";
}) {
  const reduce = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const Comp = motion[as];
  return (
    <Comp
      className={cn(className, !hydrated && "reveal-failsafe")}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: reduce ? 0.2 : 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Comp>
  );
}
