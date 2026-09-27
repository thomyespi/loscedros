export type WhatsAppContext =
  | { kind: "reserva" }
  | { kind: "consulta" }
  | { kind: "torneo"; tournamentName: string }
  | { kind: "torneos" };

export function whatsappMessage(ctx: WhatsAppContext) {
  switch (ctx.kind) {
    case "reserva":
      return "¡Hola Los Cedros! ⚽⛳ Quiero ir a jugar el día ___ a las ___. Somos ___ personas.";
    case "consulta":
      return "¡Hola Los Cedros! Tengo una consulta: ";
    case "torneo":
      return `¡Hola Los Cedros! Quiero consultar por el torneo "${ctx.tournamentName}". `;
    case "torneos":
      return "¡Hola Los Cedros! Quiero info sobre los próximos torneos: ¿cómo anoto a mi equipo?";
  }
}

export function whatsappUrl(phone: string, ctx: WhatsAppContext) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage(ctx))}`;
}
