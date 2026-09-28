import { AdminPageSkeleton } from "@/components/loading/skeletons";

export default function Loading() {
  return <AdminPageSkeleton label="Cargando torneo" cards={3} rows={3} />;
}
