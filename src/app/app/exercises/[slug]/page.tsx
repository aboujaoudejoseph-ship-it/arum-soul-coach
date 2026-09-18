import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GratitudeJarForm from "@/components/client/exercises/GratitudeJarForm";
import WheelOfLifeForm from "@/components/client/exercises/WheelOfLifeForm";
import JournalForm from "@/components/client/exercises/JournalForm";
import SelfLoveForm from "@/components/client/exercises/SelfLoveForm";
import MirrorForm from "@/components/client/exercises/MirrorForm";
import ConfidenceForm from "@/components/client/exercises/ConfidenceForm";
import GratitudeJoyHappinessForm from "@/components/client/exercises/GratitudeJoyHappinessForm";
import type { WheelValues } from "@/lib/wheel";

export default async function ExercisePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: exercise } = await supabase
    .from("exercises")
    .select("*")
    .eq("slug", params.slug)
    .eq("active", true)
    .single();

  if (!exercise) notFound();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("locked")
    .eq("client_id", user!.id)
    .eq("exercise_id", exercise.id)
    .maybeSingle();

  if (!assignment) redirect("/app");
  if (assignment.locked) redirect("/app");

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("client_id", user!.id)
    .eq("exercise_id", exercise.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const latest = submissions?.[0];

  return (
    <div>
      <Link href="/app" className="text-xs text-navy-500/50 hover:underline">
        ← Back to Today
      </Link>
      <h1 className="font-display mt-1 text-3xl text-navy-600">{exercise.title}</h1>
      <p className="mt-1 text-sm text-navy-500/60">{exercise.description}</p>

      <div className="glass mt-5 rounded-2xl p-5">
        {exercise.slug === "gratitude-jar" && (
          <GratitudeJarForm
            exerciseId={exercise.id}
            initialNotes={(submissions ?? []).map((s) => ({
              note: (s.payload as { note?: string }).note ?? "",
              created_at: s.created_at,
            }))}
          />
        )}
        {exercise.slug === "wheel-of-life" && (
          <WheelOfLifeForm
            exerciseId={exercise.id}
            initialValues={(latest?.payload as WheelValues) ?? {}}
          />
        )}
        {exercise.slug === "daily-journal" && <JournalForm exerciseId={exercise.id} />}
        {exercise.slug === "self-love-worksheet" && <SelfLoveForm exerciseId={exercise.id} />}
        {exercise.slug === "mirror-exercise" && <MirrorForm exerciseId={exercise.id} />}
        {exercise.slug === "confidence-builder" && <ConfidenceForm exerciseId={exercise.id} />}
        {exercise.slug === "gratitude-joy-happiness" && (
          <GratitudeJoyHappinessForm exerciseId={exercise.id} />
        )}
      </div>
    </div>
  );
}
