"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { Submission } from "@/lib/types";

export default function SubmissionsFeed({
  clientId,
  initialSubmissions,
  exerciseTitles,
}: {
  clientId: string;
  initialSubmissions: Submission[];
  exerciseTitles: Record<string, string>;
}) {
  const [items, setItems] = useState(initialSubmissions);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`submissions-${clientId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions", filter: `client_id=eq.${clientId}` },
        (payload) => {
          setItems((prev) => [payload.new as Submission, ...prev]);
        }
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Submissions</h3>
        {live && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            Live
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-navy-500/60">Nothing submitted yet.</p>
      ) : (
        <div className="mt-3 divide-y divide-navy-500/10">
          {items.map((s) => (
            <div key={s.id} className="py-2.5 text-sm">
              <span className="font-medium">
                {exerciseTitles[s.exercise_id] ?? "Exercise"}
              </span>
              <div className="text-xs text-navy-500/50">
                {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
