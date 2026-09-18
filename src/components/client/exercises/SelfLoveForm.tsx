"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitExercise } from "@/app/app/exercises/[slug]/actions";

export default function SelfLoveForm({ exerciseId }: { exerciseId: string }) {
  const [rating, setRating] = useState(3);
  const [innerCritic, setInnerCritic] = useState("");
  const [kinderThought, setKinderThought] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const { error } = await submitExercise(exerciseId, {
        rating,
        innerCritic,
        kinderThought,
        affirmation,
      });
      if (error) toast.error(error);
      else toast("Saved 💗");
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm text-navy-500/70">
          Rate how kind you've been to yourself today
        </label>
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} hearts`}>
              {n <= rating ? "💗" : "🤍"}
            </button>
          ))}
        </div>
      </div>

      <Field
        label="What is your inner critic saying?"
        value={innerCritic}
        onChange={setInnerCritic}
      />
      <Field
        label="Challenge it — what's a kinder, truer thought?"
        value={kinderThought}
        onChange={setKinderThought}
      />
      <Field
        label="Write yourself one affirmation for today"
        value={affirmation}
        onChange={setAffirmation}
      />

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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-navy-500/70">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-xl border border-blush-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-blush-400"
      />
    </div>
  );
}
