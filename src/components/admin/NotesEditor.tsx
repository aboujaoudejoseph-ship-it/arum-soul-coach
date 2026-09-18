"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateClientProfile } from "@/app/admin/clients/[id]/actions";

export default function NotesEditor({
  clientId,
  initialGoals,
  initialNotes,
}: {
  clientId: string;
  initialGoals: string;
  initialNotes: string;
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [notes, setNotes] = useState(initialNotes);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await updateClientProfile(clientId, { goals, notes });
      toast("Saved");
    });
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-base font-semibold">Goals &amp; notes</h3>
      <label className="mt-3 block text-xs text-navy-500/60">Goals</label>
      <textarea
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
        rows={2}
        className="mt-1 w-full rounded-lg border border-blush-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-blush-400"
        placeholder="What is this client working toward?"
      />
      <label className="mt-3 block text-xs text-navy-500/60">Private notes</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-lg border border-blush-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-blush-400"
        placeholder="Only visible to you"
      />
      <button
        onClick={save}
        disabled={pending}
        className="mt-3 rounded-full bg-navy-600 px-4 py-1.5 text-xs font-medium text-cream-50 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
