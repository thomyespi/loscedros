import { Club } from "@/components/landing/club";
import { Competition } from "@/components/landing/competition";
import { Course } from "@/components/landing/course";
import { Faq } from "@/components/landing/faq";
import { Gallery, type GalleryItem } from "@/components/landing/gallery";
import { Hero } from "@/components/landing/hero";
import { Location } from "@/components/landing/location";
import { Marquee } from "@/components/landing/marquee";
import { WhatIs } from "@/components/landing/what-is";
import { placeholderGallery } from "@/content/media";
import { SITE_URL } from "@/lib/config";
import { getHistorical, getRecentPhotos, getSpotlight, teamMap } from "@/lib/data/selectors";
import { getSnapshot } from "@/lib/data/snapshot";
import { instagramUrl } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage";

export default async function HomePage() {
  const snap = await getSnapshot();
  const { settings } = snap;
  const spotlight = getSpotlight(snap);
  const historical = getHistorical(snap);

  const photos = getRecentPhotos(snap, 8);
  const gallery: GalleryItem[] = photos.length
    ? photos.map((p) => ({ src: mediaUrl(p.path)!, alt: p.caption ?? "Foto de torneo en Los Cedros", width: p.width ?? 1600, height: p.height ?? 1200 }))
    : placeholderGallery;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "Los Cedros Footgolf",
    description: "Cancha de footgolf de 18 hoyos en Malvinas Argentinas, Buenos Aires.",
    url: SITE_URL,
    telephone: `+${settings.whatsapp}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "César Bacle 1500",
      postalCode: "B1614",
      addressLocality: "Malvinas Argentinas",
      addressRegion: "Buenos Aires",
      addressCountry: "AR",
    },
    sameAs: [instagramUrl(settings.instagram)],
    sport: "Footgolf",
  };

  return (
    <>
      <Hero whatsapp={settings.whatsapp} openingHours={settings.openingHours} spotlight={spotlight} />
      <Marquee />
      <WhatIs />
      <Club stats={{ teams: historical.length, tournaments: snap.tournaments.length }} />
      <Course openingHours={settings.openingHours} />
      <Gallery items={gallery} instagram={settings.instagram} instagramHref={instagramUrl(settings.instagram)} />
      <Location settings={settings} />
      <Faq whatsapp={settings.whatsapp} />
      <Competition spotlight={spotlight} historical={historical} teamById={teamMap(snap)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
