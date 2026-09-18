import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Call whenever a client does something that should count toward their
 * streak (a mood check-in, a completed exercise). Idempotent per day —
 * calling it twice in the same day only bumps the streak once.
 */
export async function bumpStreak(supabase: SupabaseClient, clientId: string) {
  const today = new Date().toISOString().slice(0, 10);

  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("client_id", clientId)
    .single();

  if (!streak) {
    await supabase
      .from("streaks")
      .insert({ client_id: clientId, current: 1, longest: 1, last_activity_date: today });
    return;
  }

  if (streak.last_activity_date === today) return; // already counted today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const current = streak.last_activity_date === yesterday ? streak.current + 1 : 1;
  const longest = Math.max(streak.longest, current);

  await supabase
    .from("streaks")
    .update({ current, longest, last_activity_date: today })
    .eq("client_id", clientId);
}
