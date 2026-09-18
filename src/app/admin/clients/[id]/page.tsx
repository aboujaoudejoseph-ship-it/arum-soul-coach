import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NotesEditor from "@/components/admin/NotesEditor";
import SubmissionsFeed from "@/components/admin/SubmissionsFeed";
import MoodLineChart from "@/components/admin/MoodLineChart";
import AssignExercises from "@/components/admin/AssignExercises";
import WheelRadarChart from "@/components/WheelRadarChart";
import type { WheelValues } from "@/lib/wheel";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const clientId = params.id;

  const { data: client } = await supabase
    .from("users")
    .select("*")
    .eq("id", clientId)
    .eq("role", "client")
    .single();

  if (!client) notFound();

  const [{ data: exercises }, { data: assignments }, { data: submissions }, { data: moods }] =
    await Promise.all([
      supabase.from("exercises").select("*").eq("active", true).order("title"),
      supabase.from("assignments").select("*").eq("client_id", clientId),
      supabase
        .from("submissions")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("mood_checkins")
        .select("*")
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .limit(30),
    ]);

  const exerciseTitles = Object.fromEntries((exercises ?? []).map((e) => [e.id, e.title]));
  const wheelExercise = (exercises ?? []).find((e) => e.slug === "wheel-of-life");
  const latestWheel = (submissions ?? []).find((s) => s.exercise_id === wheelExercise?.id);

  return (
    <div>
      <Link href="/admin" className="text-xs text-navy-500/50 hover:underline">
        ← All clients
      </Link>
      <h1 className="font-display mt-1 text-3xl text-navy-600">{client.name}</h1>
      <p className="text-sm text-navy-500/60">@{client.username}</p>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <NotesEditor
            clientId={clientId}
            initialGoals={client.goals ?? ""}
            initialNotes={client.notes ?? ""}
          />
          <AssignExercises
            clientId={clientId}
            exercises={exercises ?? []}
            initialAssigned={new Set((assignments ?? []).map((a) => a.exercise_id))}
            initialLocked={new Set((assignments ?? []).filter((a) => a.locked).map((a) => a.exercise_id))}
          />
        </div>

        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <h3 className="text-base font-semibold">Mood, last 30 entries</h3>
            <MoodLineChart checkins={moods ?? []} />
          </div>

          {latestWheel && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-base font-semibold">Wheel of Life (most recent)</h3>
              <WheelRadarChart values={latestWheel.payload as WheelValues} />
            </div>
          )}

          <SubmissionsFeed
            clientId={clientId}
            initialSubmissions={submissions ?? []}
            exerciseTitles={exerciseTitles}
          />
        </div>
      </div>
    </div>
  );
}
