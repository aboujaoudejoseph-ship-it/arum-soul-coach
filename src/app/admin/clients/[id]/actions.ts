"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateClientProfile(
  clientId: string,
  fields: { goals: string; notes: string }
) {
  const supabase = createClient();
  await supabase.from("users").update(fields).eq("id", clientId);
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function setAssignment(
  clientId: string,
  exerciseId: string,
  assigned: boolean
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (assigned) {
    await supabase
      .from("assignments")
      .upsert(
        { client_id: clientId, exercise_id: exerciseId, assigned_by: user!.id, locked: false },
        { onConflict: "client_id,exercise_id" }
      );
  } else {
    await supabase
      .from("assignments")
      .delete()
      .eq("client_id", clientId)
      .eq("exercise_id", exerciseId);
  }
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function setLocked(clientId: string, exerciseId: string, locked: boolean) {
  const supabase = createClient();
  await supabase
    .from("assignments")
    .update({ locked })
    .eq("client_id", clientId)
    .eq("exercise_id", exerciseId);
  revalidatePath(`/admin/clients/${clientId}`);
}
