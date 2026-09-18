"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { moodScore } from "@/lib/mood";
import type { MoodCheckin } from "@/lib/types";

export default function MoodLineChart({ checkins }: { checkins: MoodCheckin[] }) {
  const data = [...checkins]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c) => ({
      date: new Date(c.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      score: moodScore(c.emotion),
      emotion: c.emotion,
    }));

  if (data.length === 0) {
    return <p className="text-sm text-navy-500/60">No mood check-ins yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,46,74,0.08)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(_value, _name, props) => [props.payload.emotion, "Mood"]}
          contentStyle={{ borderRadius: 12, border: "1px solid rgba(42,46,74,0.1)", fontSize: 12 }}
        />
        <Line type="monotone" dataKey="score" stroke="#8a6fd3" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
