import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { faq } from "@/content/landing";

export function Faq({ whatsapp }: { whatsapp: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <section id="preguntas" className="container-page scroll-mt-24 py-20 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <SectionHeading eyebrow="Preguntas frecuentes" title="Todo lo que querés saber" />
          <Reveal className="hidden flex-col gap-3 rounded-3xl border border-white/10 bg-pitch p-6 lg:flex">
            <p className="font-semibold text-chalk">¿Te quedó alguna duda?</p>
            <p className="text-sm text-mist">Escribinos y te respondemos al toque.</p>
            <WhatsAppButton phone={whatsapp} context={{ kind: "consulta" }} size="md" className="self-start">
              Consultar
            </WhatsAppButton>
          </Reveal>
        </div>
        <div className="flex flex-col gap-2 lg:col-span-3">
          {faq.map((item, i) => (
            <Reveal key={item.q} delay={Math.min(i, 5) * 0.04}>
              <details className="group rounded-2xl border border-white/10 bg-pitch transition-colors open:border-grass/30 open:bg-pitch-2">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-chalk [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus className="size-5 shrink-0 text-grass transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="px-5 pb-5 text-mist">{item.a}</p>
              </details>
            </Reveal>
          ))}
          <WhatsAppButton phone={whatsapp} context={{ kind: "consulta" }} variant="outline" className="mt-4 lg:hidden">
            ¿Otra duda? Escribinos
          </WhatsAppButton>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
