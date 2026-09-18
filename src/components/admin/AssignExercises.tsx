"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setAssignment, setLocked } from "@/app/admin/clients/[id]/actions";
import type { Exercise } from "@/lib/types";

export default function AssignExercises({
  clientId,
  exercises,
  initialAssigned,
  initialLocked,
}: {
  clientId: string;
  exercises: Exercise[];
  initialAssigned: Set<string>;
  initialLocked: Set<string>;
}) {
  const [assigned, setAssigned] = useState(initialAssigned);
  const [locked, setLockedState] = useState(initialLocked);
  const [, startTransition] = useTransition();

  function toggleAssigned(exerciseId: string, title: string) {
    const isAssigned = assigned.has(exerciseId);
    const next = new Set(assigned);
    isAssigned ? next.delete(exerciseId) : next.add(exerciseId);
    setAssigned(next);
    startTransition(async () => {
      await setAssignment(clientId, exerciseId, !isAssigned);
      toast(isAssigned ? `${title} removed` : `${title} assigned`);
    });
  }

  function toggleLocked(exerciseId: string) {
    const isLocked = locked.has(exerciseId);
    const next = new Set(locked);
    isLocked ? next.delete(exerciseId) : next.add(exerciseId);
    setLockedState(next);
    startTransition(() => setLocked(clientId, exerciseId, !isLocked));
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-base font-semibold">Assigned exercises</h3>
      <div className="mt-3 space-y-2">
        {exercises.map((ex) => {
          const isAssigned = assigned.has(ex.id);
          return (
            <div key={ex.id} className="flex items-center justify-between gap-2 text-sm">
              <label className="flex flex-1 items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAssigned}
                  onChange={() => toggleAssigned(ex.id, ex.title)}
                  className="h-4 w-4 accent-blush-500"
                />
                {ex.title}
              </label>
              {isAssigned && (
                <button
                  onClick={() => toggleLocked(ex.id)}
                  className={
                    "rounded-full px-2.5 py-1 text-xs font-medium " +
                    (locked.has(ex.id)
                      ? "bg-navy-500/10 text-navy-500/60"
                      : "bg-green-100 text-green-700")
                  }
                >
                  {locked.has(ex.id) ? "🔒 Locked" : "Unlocked"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
