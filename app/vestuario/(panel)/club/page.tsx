import type { Metadata } from "next";
import { CourseMapCard } from "@/components/admin/course-map-card";
import { SettingsForm } from "@/components/admin/settings-form";
import { AdminPage } from "@/components/admin/ui";
import { getAdminSnapshot } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Datos del club" };

export default async function ClubSettingsPage() {
  const snap = await getAdminSnapshot();
  const { courseMap, ...info } = snap.settings;
  return (
    <AdminPage title="Datos del club" subtitle="Se muestran en la landing, el footer y los botones de WhatsApp. El mapa se ve en «La cancha».">
      <SettingsForm initial={info} />
      <CourseMapCard courseMap={courseMap} />
    </AdminPage>
  );
}
