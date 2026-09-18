"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MOODS } from "@/lib/mood";
import { checkInMood } from "@/app/app/actions";
import { confettiFromElement } from "@/lib/confetti";

export default function MoodCheckin({ initialEmotion }: { initialEmotion: string | null }) {
  const [selected, setSelected] = useState(initialEmotion);
  const [pending, startTransition] = useTransition();

  function pick(key: string, label: string, el: HTMLElement) {
    setSelected(key);
    confettiFromElement(el);
    startTransition(async () => {
      await checkInMood(key);
      toast(`Feeling ${label.toLowerCase()} — logged for today`);
    });
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {MOODS.filter((m) => m.key !== "hopeful").map((m) => (
        <button
          key={m.key}
          onClick={(e) => pick(m.key, m.label, e.currentTarget)}
          disabled={pending}
          className={
            "flex-1 min-w-[64px] rounded-2xl border px-2 py-3 text-center transition " +
            (selected === m.key
              ? "border-transparent bg-gradient-to-br from-blush-400 to-lavender-400 text-white shadow-glow scale-105"
              : "border-blush-200 bg-white/50 hover:-translate-y-0.5")
          }
        >
          <span className="block text-2xl">{m.emoji}</span>
          <span className="mt-1 block text-[10px] font-medium">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
