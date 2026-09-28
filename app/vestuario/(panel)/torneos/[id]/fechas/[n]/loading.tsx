import { AdminPageSkeleton } from "@/components/loading/skeletons";

export default function Loading() {
  return <AdminPageSkeleton label="Cargando fecha" cards={3} rows={4} />;
}
