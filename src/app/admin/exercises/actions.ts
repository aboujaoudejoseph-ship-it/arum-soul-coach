"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleExerciseActive(exerciseId: string, active: boolean) {
  const supabase = createClient();
  await supabase.from("exercises").update({ active }).eq("id", exerciseId);
  revalidatePath("/admin/exercises");
}

export async function updateExercise(
  exerciseId: string,
  fields: { title: string; description: string }
) {
  const supabase = createClient();
  await supabase.from("exercises").update(fields).eq("id", exerciseId);
  revalidatePath("/admin/exercises");
}
