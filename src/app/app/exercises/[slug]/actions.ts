"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bumpStreak } from "@/lib/streak";

export async function submitExercise(exerciseId: string, payload: Record<string, unknown>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = await supabase
    .from("submissions")
    .insert({ client_id: user.id, exercise_id: exerciseId, payload });
  if (error) return { error: error.message };

  await bumpStreak(supabase, user.id);
  revalidatePath("/app");
  return { error: null };
}
