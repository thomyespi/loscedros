/**
 * Textos fijos de la landing. Editalos acá sin tocar componentes.
 * ⚠️ Los textos del club y los servicios son PROVISORIOS: confirmalos con Los Cedros.
 */
import type { Modality } from "@/lib/domain/types";

export const hero = {
  eyebrow: "Footgolf · Malvinas Argentinas",
  titleTop: "Pateala",
  titleBottom: "hasta el hoyo",
  subtitle:
    "18 hoyos de fútbol y golf al aire libre. Vení con amigos, en familia o armá tu equipo para los torneos de Los Cedros.",
};

export const whatIs = {
  eyebrow: "¿Qué es el footgolf?",
  title: "Fútbol + golf. Así de simple.",
  description:
    "Se juega en una cancha de golf adaptada con una pelota de fútbol N° 5. El objetivo: llevarla desde la salida hasta un hoyo de 53 cm en la menor cantidad de toques posible.",
  steps: [
    { n: "01", title: "Salí desde el tee", text: "Cada hoyo arranca en la zona de salida. Primer toque: con potencia y dirección." },
    { n: "02", title: "Avanzá por la calle", text: "Esquivá árboles, lomas y obstáculos. Cada toque cuenta." },
    { n: "03", title: "Embocala", text: "Cerca de la bandera, precisión pura: la pelota tiene que entrar en el hoyo." },
    { n: "04", title: "Menos toques, gana", text: "Sumá los toques de los 18 hoyos. El que menos hizo, se lleva la gloria." },
  ],
};

export const club = {
  eyebrow: "El club",
  title: "Un lugar para jugar, competir y pasarla bien",
  paragraphs: [
    "Los Cedros nació con una idea simple: que cualquiera pueda disfrutar del footgolf, sin importar la edad ni si alguna vez pateó una pelota en serio.",
    "Hoy somos punto de encuentro para grupos de amigos, familias y equipos amateur que cada fecha se juegan el honor en nuestros torneos.",
  ],
  highlights: [
    { value: 18, suffix: "", label: "hoyos" },
    { value: 3, suffix: "", label: "modalidades de torneo" },
    { value: 10, suffix: " h", label: "abierto cada día" },
  ],
};

export const course = {
  eyebrow: "La cancha",
  title: "18 hoyos entre cedros",
  description:
    "Un recorrido completo con salidas largas, doglegs y greens que ponen a prueba tu precisión. Ideal para jugar una vuelta tranquila o salir a buscar el récord.",
  features: [
    { icon: "flag", title: "18 hoyos", text: "Recorrido completo, con hoyos para todos los niveles." },
    { icon: "clock", title: "Abierto todos los días", text: "Vení cuando quieras dentro del horario; solo avisanos." },
    { icon: "users", title: "Para todas las edades", text: "Chicos, grandes, amigos, familias y equipos." },
    { icon: "trophy", title: "Torneos por equipos", text: "Fechas durante todo el año con tabla y ranking histórico." },
  ],
};

export const modalities: { id: Modality; name: string; tag: string; players: string; text: string }[] = [
  {
    id: "individual",
    name: "Individual",
    tag: "Mano a mano",
    players: "1 vs 1",
    text: "Cada equipo manda a su mejor jugador. Se juega hoyo por hoyo: gana el hoyo quien lo complete con menos toques, y gana el match quien se lleve más hoyos.",
  },
  {
    id: "four_ball",
    name: "Four Ball",
    tag: "Mejor pelota",
    players: "2 vs 2",
    text: "Parejas. Cada jugador patea su propia pelota y en cada hoyo cuenta el mejor resultado de la pareja. Ideal para arriesgar: si uno falla, el otro banca.",
  },
  {
    id: "foursome",
    name: "Foursome",
    tag: "Toques alternados",
    players: "2 vs 2",
    text: "Parejas con una sola pelota que patean de manera alternada. Pura estrategia y confianza en el compañero: el más difícil de los tres.",
  },
];

export const scoring = {
  title: "¿Cómo se suman los puntos?",
  text: "En cada fecha los equipos se enfrentan en un cruce que tiene las 3 modalidades. Cada modalidad ganada suma 3 puntos. No hay empates: siempre gana alguien.",
};

export const events = {
  eyebrow: "Eventos y grupos",
  title: "Tu próximo plan es acá",
  description:
    "Cumpleaños, salidas de empresa, despedidas, colegios o simplemente una juntada distinta. Armamos la experiencia para tu grupo.",
  items: ["Cumpleaños", "Empresas y team building", "Despedidas", "Colegios y clubes", "Grupos de amigos"],
};

export const faq: { q: string; a: string }[] = [
  {
    q: "¿Tengo que saber jugar al fútbol?",
    a: "Para nada. Si podés patear una pelota, podés jugar. Es un deporte para todas las edades y niveles.",
  },
  {
    q: "¿Hay que reservar?",
    a: "No hace falta una reserva formal, pero avisanos por WhatsApp que venís (día, hora y cuántos son) así te esperamos.",
  },
  {
    q: "¿Qué tengo que llevar?",
    a: "Ropa cómoda y zapatillas o botines multitapón (evitá los tapones de aluminio para cuidar la cancha). Si tenés pelota N° 5, traela.",
  },
  {
    q: "¿Cuánto dura una vuelta de 18 hoyos?",
    a: "Depende del grupo, pero calculá entre 2 y 3 horas para recorrer los 18 hoyos sin apuro.",
  },
  {
    q: "¿Pueden jugar chicos?",
    a: "¡Sí! El footgolf es ideal para chicos y para compartir en familia.",
  },
  {
    q: "¿Cómo anoto a mi equipo en un torneo?",
    a: "Escribinos por WhatsApp. Te contamos cuándo arranca el próximo torneo y cómo sumarte con tu equipo.",
  },
  {
    q: "¿Cómo funcionan los puntos en los torneos?",
    a: "Cada cruce entre dos equipos tiene 3 modalidades: Individual, Four Ball y Foursome. Cada modalidad ganada suma 3 puntos y nunca hay empate.",
  },
  {
    q: "¿Qué pasa si llueve?",
    a: "Si el clima no acompaña, consultanos por WhatsApp ese mismo día. Las fechas de torneo suspendidas se reprograman.",
  },
  {
    q: "¿Organizan eventos privados?",
    a: "Sí: cumpleaños, empresas, colegios y grupos. Escribinos y armamos una propuesta a medida.",
  },
];
