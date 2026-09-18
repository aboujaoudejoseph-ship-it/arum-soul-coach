"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitExercise } from "@/app/app/exercises/[slug]/actions";

type Pair = { negative: string; positive: string };

export default function MirrorForm({ exerciseId }: { exerciseId: string }) {
  const [pairs, setPairs] = useState<Pair[]>([{ negative: "", positive: "" }]);
  const [pending, startTransition] = useTransition();

  function update(i: number, field: keyof Pair, value: string) {
    setPairs((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }

  function save() {
    const cleaned = pairs.filter((p) => p.negative.trim() && p.positive.trim());
    if (cleaned.length === 0) {
      toast.error("Fill in at least one pair first");
      return;
    }
    startTransition(async () => {
      const { error } = await submitExercise(exerciseId, { pairs: cleaned });
      if (error) toast.error(error);
      else toast("Saved 🪞");
    });
  }

  return (
    <div className="space-y-3">
      {pairs.map((p, i) => (
        <div key={i} className="glass grid grid-cols-1 gap-2 rounded-xl p-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-navy-500/50">Negative self-talk</label>
            <input
              value={p.negative}
              onChange={(e) => update(i, "negative", e.target.value)}
              className="w-full rounded-lg border border-blush-200 bg-white/70 px-3 py-2 text-sm outline-none line-through decoration-blush-400"
              placeholder="I always mess this up"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-navy-500/50">Positive replacement</label>
            <input
              value={p.positive}
              onChange={(e) => update(i, "positive", e.target.value)}
              className="w-full rounded-lg border border-blush-200 bg-white/70 px-3 py-2 text-sm outline-none"
              placeholder="I'm learning, and that's enough"
            />
          </div>
        </div>
      ))}
      <button
        onClick={() => setPairs((p) => [...p, { negative: "", positive: "" }])}
        className="text-xs font-medium text-navy-500/60 hover:text-navy-600"
      >
        + Add another
      </button>
      <div>
        <button
          onClick={save}
          disabled={pending}
          className="rounded-full bg-navy-600 px-5 py-2 text-sm font-medium text-cream-50 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
