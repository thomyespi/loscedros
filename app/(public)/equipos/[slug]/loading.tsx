import { PublicPageSkeleton } from "@/components/loading/skeletons";

export default function Loading() {
  return <PublicPageSkeleton label="Cargando equipo" items={5} avatar />;
}
