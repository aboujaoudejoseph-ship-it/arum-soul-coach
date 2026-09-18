"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitExercise } from "@/app/app/exercises/[slug]/actions";

export default function ConfidenceForm({ exerciseId }: { exerciseId: string }) {
  const [strengths, setStrengths] = useState<string[]>([""]);
  const [proudMoments, setProudMoments] = useState<string[]>([""]);
  const [believers, setBelievers] = useState<string[]>([""]);
  const [iCan, setICan] = useState("");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const { error } = await submitExercise(exerciseId, {
        strengths: strengths.filter(Boolean),
        proudMoments: proudMoments.filter(Boolean),
        believers: believers.filter(Boolean),
        iCan,
      });
      if (error) toast.error(error);
      else toast("Saved ⭐");
    });
  }

  return (
    <div className="space-y-5">
      <TagList label="Your strengths" values={strengths} onChange={setStrengths} />
      <TagList label="Moments you're proud of" values={proudMoments} onChange={setProudMoments} />
      <TagList label="People who believe in you" values={believers} onChange={setBelievers} />

      <div>
        <label className="mb-1 block text-sm text-navy-500/70">Finish the sentence: "I CAN…"</label>
        <input
          value={iCan}
          onChange={(e) => setICan(e.target.value)}
          className="w-full rounded-xl border border-blush-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-blush-400"
        />
      </div>

      <button
        onClick={save}
        disabled={pending}
        className="rounded-full bg-navy-600 px-5 py-2 text-sm font-medium text-cream-50 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

function TagList({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-navy-500/70">{label}</label>
      {values.map((v, i) => (
        <input
          key={i}
          value={v}
          onChange={(e) =>
            onChange(values.map((x, idx) => (idx === i ? e.target.value : x)))
          }
          className="mb-2 w-full rounded-xl border border-blush-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-blush-400"
        />
      ))}
      <button
        onClick={() => onChange([...values, ""])}
        className="text-xs font-medium text-navy-500/60 hover:text-navy-600"
      >
        + Add
      </button>
    </div>
  );
}
