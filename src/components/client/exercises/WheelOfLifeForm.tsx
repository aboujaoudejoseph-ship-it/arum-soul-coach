"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { WHEEL_AREAS, type WheelValues } from "@/lib/wheel";
import WheelRadarChart from "@/components/WheelRadarChart";
import { submitExercise } from "@/app/app/exercises/[slug]/actions";
import { confettiFromElement } from "@/lib/confetti";

export default function WheelOfLifeForm({
  exerciseId,
  initialValues,
}: {
  exerciseId: string;
  initialValues: WheelValues;
}) {
  const [values, setValues] = useState<WheelValues>(() => {
    const v: WheelValues = {};
    WHEEL_AREAS.forEach((a) => (v[a.key] = initialValues[a.key] ?? 5));
    return v;
  });
  const [pending, startTransition] = useTransition();

  function save(e: React.MouseEvent<HTMLButtonElement>) {
    confettiFromElement(e.currentTarget);
    startTransition(async () => {
      const { error } = await submitExercise(exerciseId, values);
      if (error) toast.error(error);
      else toast("Wheel of Life saved — your coach can see this now ✨");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        {WHEEL_AREAS.map((a) => (
          <div key={a.key} className="mb-4">
            <div className="mb-1 flex justify-between text-sm">
              <span>{a.label}</span>
              <span className="font-semibold text-blush-500">{values[a.key]}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={values[a.key]}
              onChange={(e) => setValues((v) => ({ ...v, [a.key]: Number(e.target.value) }))}
              className="w-full accent-blush-500"
            />
          </div>
        ))}
      </div>
      <div>
        <WheelRadarChart values={values} />
        <button
          onClick={save}
          disabled={pending}
          className="mt-2 w-full rounded-full bg-navy-600 py-2.5 text-sm font-medium text-cream-50 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save today's wheel"}
        </button>
      </div>
    </div>
  );
}
