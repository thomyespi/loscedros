"use server";

import { requireAdmin } from "@/lib/auth";
import { refreshPublicData } from "@/lib/admin/revalidate";
import { dbMessage, fail, ok, type ActionResult } from "@/lib/admin/result";
import { firstError, settingsSchema } from "@/lib/validation";

export async function saveSettings(input: { openingHours: string; whatsapp: string; instagram: string; address: string }): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const { openingHours, whatsapp, instagram, address } = parsed.data;
  const { error } = await supabase
    .from("site_settings")
    .update({ opening_hours: openingHours, whatsapp, instagram, address })
    .eq("id", 1);
  if (error) return fail(dbMessage(error));
  refreshPublicData();
  return ok();
}
