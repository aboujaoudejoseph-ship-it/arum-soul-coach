"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitExercise } from "@/app/app/exercises/[slug]/actions";

const SECTIONS: { key: "gratitude" | "joy" | "happiness"; label: string; prompts: string[] }[] = [
  { key: "gratitude", label: "Gratitude", prompts: ["I'm grateful for…", "Today gave me…"] },
  { key: "joy", label: "Joy", prompts: ["A moment that lit me up…", "Something silly that made me laugh…"] },
  { key: "happiness", label: "Happiness", prompts: ["A small comfort I enjoyed…", "Someone who made today better…"] },
];

export default function GratitudeJoyHappinessForm({ exerciseId }: { exerciseId: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const { error } = await submitExercise(exerciseId, values);
      if (error) toast.error(error);
      else toast("Saved 😊");
    });
  }

  return (
    <div className="space-y-6">
      {SECTIONS.map((s) => (
        <div key={s.key}>
          <h3 className="mb-2 text-sm font-semibold text-navy-600">{s.label}</h3>
          <div className="space-y-2">
            {s.prompts.map((p, i) => {
              const fieldKey = `${s.key}_${i}`;
              return (
                <input
                  key={fieldKey}
                  value={values[fieldKey] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [fieldKey]: e.target.value }))}
                  placeholder={p}
                  className="w-full rounded-xl border border-blush-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-blush-400"
                />
              );
            })}
          </div>
        </div>
      ))}
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
