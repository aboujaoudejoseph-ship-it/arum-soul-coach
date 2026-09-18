"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { submitExercise } from "@/app/app/exercises/[slug]/actions";
import { confettiFromElement } from "@/lib/confetti";
import GratitudeJar3D from "./GratitudeJar3D";

const PROMPTS = [
  "What's one thing that made you smile today?",
  "Who are you thankful for?",
  "What part of nature are you grateful for?",
];

export default function GratitudeJarForm({
  exerciseId,
  initialNotes,
}: {
  exerciseId: string;
  initialNotes: { note: string; created_at: string }[];
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  function add() {
    const value = text.trim();
    if (!value) return;
    setText("");
    setNotes((prev) => [{ note: value, created_at: new Date().toISOString() }, ...prev]);
    if (addBtnRef.current) confettiFromElement(addBtnRef.current);
    startTransition(async () => {
      const { error } = await submitExercise(exerciseId, { note: value });
      if (error) toast.error(error);
      else toast("Added to your jar 🫙");
    });
  }

  return (
    <div>
      <div className="mx-auto h-[320px] max-w-xs">
        <GratitudeJar3D noteCount={notes.length} />
      </div>

      <p className="text-center text-sm italic text-navy-500/60">"{prompt}"</p>
      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="I'm grateful for…"
          className="flex-1 rounded-xl border border-blush-200 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-blush-400"
        />
        <button
          ref={addBtnRef}
          onClick={add}
          disabled={pending}
          className="rounded-full bg-navy-600 px-5 py-2 text-sm font-medium text-cream-50 disabled:opacity-60"
        >
          Add
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {notes.length === 0 && (
          <p className="text-sm text-navy-500/50">Your jar is empty — add your first note above.</p>
        )}
        {notes.map((n, i) => (
          <div key={i} className="glass rounded-xl px-4 py-2.5 text-sm">
            {n.note}
          </div>
        ))}
      </div>
    </div>
  );
}
