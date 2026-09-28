import { Clock, Flag, Trophy, Users } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";
import { course } from "@/content/landing";
import { media } from "@/content/media";
import type { CourseMap as CourseMapData } from "@/lib/domain/types";
import { mediaUrl } from "@/lib/storage";
import { CourseMap } from "./course-map";

const ICONS = { flag: Flag, clock: Clock, users: Users, trophy: Trophy } as const;

export function Course({ openingHours, courseMap }: { openingHours: string; courseMap: CourseMapData | null }) {
  const mapSrc = courseMap ? mediaUrl(courseMap.path) : null;
  return (
    <section id="cancha" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading eyebrow={course.eyebrow} title={course.title} description={course.description} />

        <Reveal className="relative mt-10 overflow-hidden rounded-3xl" y={40}>
          <div className="relative aspect-[4/5] sm:aspect-[16/8]">
            <Image src={media.flag9.src} alt={media.flag9.alt} fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
            <span
              aria-hidden
              className="font-display absolute -top-4 right-2 text-[11rem] leading-none text-white/15 sm:right-8 sm:text-[18rem]"
            >
              18
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <div className="glass inline-flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3">
              <Clock className="size-5 text-grass" />
              <div>
                <p className="text-xs tracking-widest text-mist uppercase">Horarios</p>
                <p className="font-semibold text-chalk">{openingHours}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {course.features.map((f, i) => {
            const Icon = ICONS[f.icon as keyof typeof ICONS];
            return (
              <Reveal as="li" key={f.title} delay={i * 0.06} className="flex gap-4 rounded-2xl border border-white/10 bg-pitch p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-grass/10 text-grass">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold text-chalk">{f.title}</h3>
                  <p className="mt-0.5 text-sm text-mist">{f.text}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>

        {courseMap && mapSrc && <CourseMap src={mapSrc} width={courseMap.width} height={courseMap.height} />}
      </div>
    </section>
  );
}
