import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotosManager } from "@/components/admin/photos-manager";
import { AdminPage } from "@/components/admin/ui";
import { getAdminSnapshot } from "@/lib/admin/data";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";

export const metadata: Metadata = { title: "Fotos" };

export default async function AdminPhotosPage({ params }: PageProps<"/vestuario/torneos/[id]/fotos">) {
  const { id } = await params;
  const snap = await getAdminSnapshot();
  const tournament = snap.tournaments.find((t) => t.id === id);
  if (!tournament) notFound();

  const rounds = snap.rounds
    .filter((r) => r.tournamentId === id)
    .sort((a, b) => a.number - b.number)
    .map((r) => ({ id: r.id, number: r.number }));
  const photos = snap.photos
    .filter((p) => p.tournamentId === id)
    .map((p) => ({ id: p.id, path: p.path, caption: p.caption, roundId: p.roundId }));

  return (
    <AdminPage title="Fotos" subtitle={`${tournament.name} · ${photos.length} fotos`} back={{ href: `${ADMIN_BASE_PATH}/torneos/${id}`, label: tournament.name }}>
      <PhotosManager tournamentId={id} coverPath={tournament.coverPath} rounds={rounds} photos={photos} />
    </AdminPage>
  );
}
