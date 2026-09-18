"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitExercise } from "@/app/app/exercises/[slug]/actions";

const PROMPTS = [
  "What's one thing you handled well today?",
  "What's weighing on you right now?",
  "What would make tomorrow feel lighter?",
  "What did you learn about yourself this week?",
];

export default function JournalForm({ exerciseId }: { exerciseId: string }) {
  const [entry, setEntry] = useState("");
  const [pending, startTransition] = useTransition();
  const [prompt] = useState(() => PROMPTS[new Date().getDate() % PROMPTS.length]);

  function save() {
    if (!entry.trim()) return;
    startTransition(async () => {
      const { error } = await submitExercise(exerciseId, { entry, prompt });
      if (error) toast.error(error);
      else {
        toast("Journal entry saved 📓");
        setEntry("");
      }
    });
  }

  return (
    <div>
      <p className="text-sm italic text-navy-500/60">"{prompt}"</p>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        rows={10}
        placeholder="Start writing…"
        className="mt-4 w-full rounded-2xl border border-blush-200 bg-white/70 p-4 text-sm outline-none focus:border-blush-400"
      />
      <button
        onClick={save}
        disabled={pending || !entry.trim()}
        className="mt-3 rounded-full bg-navy-600 px-5 py-2 text-sm font-medium text-cream-50 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save entry"}
      </button>
    </div>
  );
}
