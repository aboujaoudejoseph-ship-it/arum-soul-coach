"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bumpStreak } from "@/lib/streak";

export async function checkInMood(emotion: string, note?: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from("mood_checkins")
    .upsert(
      { client_id: user.id, emotion, note: note ?? null, date: today },
      { onConflict: "client_id,date" }
    );
  await bumpStreak(supabase, user.id);
  revalidatePath("/app");
}
