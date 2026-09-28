import { AdminPageSkeleton } from "@/components/loading/skeletons";

export default function Loading() {
  return <AdminPageSkeleton label="Cargando datos del club" cards={3} rows={1} />;
}
