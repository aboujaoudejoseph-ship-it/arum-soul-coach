import { createClient } from "@/lib/supabase/server";
import ExerciseLibraryCard from "@/components/admin/ExerciseLibraryCard";

export const runtime = "edge";

export default async function ExerciseLibraryPage() {
  const supabase = createClient();
  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .order("title");

  return (
    <div>
      <h1 className="font-display text-3xl text-navy-600">Exercise Library</h1>
      <p className="mt-1 text-sm text-navy-500/70">
        Toggle which exercises exist and edit their prompts. Disabled
        exercises stay hidden from every client, regardless of assignment.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(exercises ?? []).map((ex) => (
          <ExerciseLibraryCard key={ex.id} exercise={ex} />
        ))}
      </div>
    </div>
  );
}
