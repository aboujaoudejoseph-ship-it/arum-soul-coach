"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleExerciseActive, updateExercise } from "@/app/admin/exercises/actions";
import type { Exercise } from "@/lib/types";

export default function ExerciseLibraryCard({ exercise }: { exercise: Exercise }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(exercise.title);
  const [description, setDescription] = useState(exercise.description ?? "");
  const [active, setActive] = useState(exercise.active);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      await toggleExerciseActive(exercise.id, next);
      toast(next ? `${exercise.title} enabled` : `${exercise.title} disabled`);
    });
  }

  function handleSave() {
    startTransition(async () => {
      await updateExercise(exercise.id, { title, description });
      setEditing(false);
      toast("Exercise updated");
    });
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        {editing ? (
          <div className="flex-1 space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-blush-200 bg-white/70 px-2 py-1 text-sm font-semibold outline-none"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-blush-200 bg-white/70 px-2 py-1 text-xs outline-none"
            />
          </div>
        ) : (
          <div>
            <div className="font-semibold text-navy-600">{exercise.title}</div>
            <p className="mt-1 text-xs text-navy-500/60">{exercise.description}</p>
          </div>
        )}
        <button
          onClick={handleToggle}
          disabled={pending}
          className={
            "shrink-0 rounded-full px-3 py-1 text-xs font-semibold " +
            (active ? "bg-green-100 text-green-700" : "bg-navy-500/10 text-navy-500/50")
          }
        >
          {active ? "Active" : "Disabled"}
        </button>
      </div>

      <div className="mt-3">
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={pending}
              className="rounded-full bg-navy-600 px-3 py-1 text-xs font-medium text-cream-50"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full border border-navy-500/20 px-3 py-1 text-xs"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-navy-500/60 hover:text-navy-600"
          >
            Edit prompt →
          </button>
        )}
      </div>
    </div>
  );
}
