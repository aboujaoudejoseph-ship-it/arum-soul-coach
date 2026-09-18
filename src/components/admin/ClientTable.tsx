"use client";

import { useState } from "react";
import Link from "next/link";

export interface ClientRow {
  id: string;
  name: string;
  username: string;
  status: "active" | "idle";
  lastActivity: string; // human-readable, already formatted server-side
  streak: number;
}

export default function ClientTable({ rows }: { rows: ClientRow[] }) {
  const [q, setQ] = useState("");
  const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(q.toLowerCase()) ||
    r.username.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search clients…"
        className="mb-3 w-full max-w-xs rounded-xl border border-blush-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-blush-400"
      />
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-navy-500/10 text-left text-xs uppercase tracking-wide text-navy-500/50">
            <th className="py-2 pr-2">Name</th>
            <th className="py-2 pr-2">Status</th>
            <th className="py-2 pr-2">Last activity</th>
            <th className="py-2 pr-2">Streak</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-navy-500/10 last:border-none">
              <td className="py-3 pr-2">
                <Link href={`/admin/clients/${r.id}`} className="flex items-center gap-2 font-medium hover:underline">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 text-xs font-bold text-white">
                    {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  {r.name}
                </Link>
              </td>
              <td className="py-3 pr-2">
                <span
                  className={
                    "rounded-full px-2.5 py-1 text-xs font-semibold " +
                    (r.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-navy-500/10 text-navy-500/50")
                  }
                >
                  {r.status === "active" ? "Active" : "Idle"}
                </span>
              </td>
              <td className="py-3 pr-2 text-navy-500/70">{r.lastActivity}</td>
              <td className="py-3 pr-2">{r.streak > 0 ? `🔥 ${r.streak}d` : "—"}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-navy-500/50">
                No clients match "{q}"
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
