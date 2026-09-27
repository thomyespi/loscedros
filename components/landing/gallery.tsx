import Image from "next/image";
import { InstagramIcon } from "@/components/brand/icons";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const SPANS = ["row-span-2", "", "", "row-span-2", "", "", "", ""];

export function Gallery({ items, instagramHref, instagram }: { items: GalleryItem[]; instagramHref: string; instagram: string }) {
  return (
    <section id="galeria" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Galería"
          title="Así se vive"
          action={
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-grass"
            >
              <InstagramIcon className="size-5" /> @{instagram}
            </a>
          }
        />
      </div>
      {/* Mobile: carrusel con snap. Desktop: mosaico. */}
      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:hidden">
        {items.map((item, i) => (
          <div key={item.src + i} className="relative aspect-[3/4] w-[72vw] shrink-0 snap-center overflow-hidden rounded-2xl">
            <Image src={item.src} alt={item.alt} fill sizes="72vw" className="object-cover" />
          </div>
        ))}
      </div>
      <div className="container-page mt-10 hidden auto-rows-[14rem] grid-cols-4 gap-3 sm:grid">
        {items.slice(0, 8).map((item, i) => (
          <Reveal key={item.src + i} delay={(i % 4) * 0.06} className={cn("group relative overflow-hidden rounded-2xl", SPANS[i])}>
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
