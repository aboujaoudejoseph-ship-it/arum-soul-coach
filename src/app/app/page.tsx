import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MoodCheckin from "@/components/client/MoodCheckin";

export const runtime = "edge";

const AFFIRMATIONS = [
  "You are enough. You are worthy. You are loved.",
  "Small steps still move you forward.",
  "You don't have to earn rest.",
  "Your feelings are valid, even the hard ones.",
];

export default async function ClientTodayPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: profile }, { data: assignments }, { data: streak }, { data: todaysMood }] =
    await Promise.all([
      supabase.from("users").select("name").eq("id", user!.id).single(),
      supabase
        .from("assignments")
        .select("id, locked, exercises(id, slug, title, description, icon, active)")
        .eq("client_id", user!.id),
      supabase.from("streaks").select("*").eq("client_id", user!.id).single(),
      supabase
        .from("mood_checkins")
        .select("emotion")
        .eq("client_id", user!.id)
        .eq("date", today)
        .maybeSingle(),
    ]);

  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const affirmation = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];
  const activeAssignments = (assignments ?? []).filter((a: any) => a.exercises?.active);

  return (
    <div>
      <h1 className="font-display text-3xl text-navy-600">Good day, {firstName}</h1>
      <p className="mt-1 text-sm text-navy-500/70">Here's your space for today.</p>

      <div className="glass mt-5 rounded-2xl px-5 py-3 text-center text-sm italic text-navy-500/70">
        ✦ "{affirmation}" ✦
      </div>

      <div className="glass mt-5 rounded-2xl p-5">
        <h3 className="text-base font-semibold">How are you feeling?</h3>
        <div className="mt-3">
          <MoodCheckin initialEmotion={todaysMood?.emotion ?? null} />
        </div>
      </div>

      <div className="glass mt-5 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 text-lg font-bold text-white">
            {streak?.current ?? 0}
          </div>
          <div>
            <div className="text-sm font-semibold">
              {streak?.current ? `${streak.current}-day streak` : "Start your streak today"}
            </div>
            <div className="text-xs text-navy-500/50">
              Longest streak: {streak?.longest ?? 0} days
            </div>
          </div>
        </div>

        <h3 className="mt-5 text-base font-semibold">Today's exercises</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {activeAssignments.length === 0 && (
            <p className="col-span-full text-sm text-navy-500/60">
              Nothing assigned yet — your coach will add exercises soon.
            </p>
          )}
          {activeAssignments.map((a: any) => (
            <Link
              key={a.id}
              href={a.locked ? "#" : `/app/exercises/${a.exercises.slug}`}
              className={
                "glass rounded-2xl p-4 text-left transition " +
                (a.locked ? "pointer-events-none opacity-50 grayscale" : "hover:-translate-y-0.5")
              }
            >
              <div className="text-xl">{a.locked ? "🔒" : "✦"}</div>
              <div className="mt-2 text-sm font-semibold">{a.exercises.title}</div>
              <div className="mt-1 text-xs text-navy-500/50">
                {a.locked ? "Locked by your coach" : a.exercises.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
