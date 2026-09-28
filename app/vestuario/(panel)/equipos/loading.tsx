import { AdminListSkeleton } from "@/components/loading/skeletons";

export default function Loading() {
  return <AdminListSkeleton label="Cargando equipos" items={8} />;
}
