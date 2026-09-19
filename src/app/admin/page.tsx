import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { moodScore } from "@/lib/mood";
import EngagementChart from "@/components/admin/EngagementChart";
import ClientTable, { type ClientRow } from "@/components/admin/ClientTable";

export const runtime = "edge";

export default async function AdminOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clients } = await supabase
    .from("users")
    .select("id, name, username, created_at")
    .eq("coach_id", user!.id)
    .eq("role", "client");

  const clientIds = (clients ?? []).map((c) => c.id);
  const hasClients = clientIds.length > 0;

  let streaks: any[] = [];
  let submissions: any[] = [];
  let moods: any[] = [];
  let submissionCount = 0;

  if (hasClients) {
    const [streaksRes, submissionsRes, moodsRes, countRes] = await Promise.all([
      supabase.from("streaks").select("*").in("client_id", clientIds),
      supabase
        .from("submissions")
        .select("id, client_id, created_at")
        .in("client_id", clientIds)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("mood_checkins")
        .select("client_id, emotion, date")
        .in("client_id", clientIds)
        .gte("date", new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10)),
      supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .in("client_id", clientIds),
    ]);
    streaks = streaksRes.data ?? [];
    submissions = submissionsRes.data ?? [];
    moods = moodsRes.data ?? [];
    submissionCount = countRes.count ?? 0;
  }

  // last activity per client = most recent submission or mood check-in
  const lastActivity = new Map<string, string>();
  submissions.forEach((s) => {
    const prev = lastActivity.get(s.client_id);
    if (!prev || s.created_at > prev) lastActivity.set(s.client_id, s.created_at);
  });
  moods.forEach((m) => {
    const prev = lastActivity.get(m.client_id);
    if (!prev || m.date > prev) lastActivity.set(m.client_id, m.date);
  });

  const streakByClient = new Map((streaks ?? []).map((s) => [s.client_id, s]));

  const rows: ClientRow[] = (clients ?? []).map((c) => {
    const last = lastActivity.get(c.id);
    const activeThisWeek = last ? Date.now() - new Date(last).getTime() < 7 * 86400000 : false;
    return {
      id: c.id,
      name: c.name,
      username: c.username,
      status: activeThisWeek ? "active" : "idle",
      lastActivity: last ? formatDistanceToNow(new Date(last), { addSuffix: true }) : "Never",
      streak: streakByClient.get(c.id)?.current ?? 0,
    };
  });

  const activeThisWeekCount = rows.filter((r) => r.status === "active").length;
  const avgMood =
    (moods ?? []).length > 0
      ? (moods ?? []).reduce((sum, m) => sum + moodScore(m.emotion), 0) / (moods ?? []).length
      : null;

  // engagement chart: submissions per day, last 14 days
  const days: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    const count = (submissions ?? []).filter((s) => s.created_at.slice(0, 10) === key).length;
    days.push({ day: label, count });
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-navy-600">Overview</h1>
      <p className="mt-1 text-sm text-navy-500/70">
        Good morning — here's how your clients are doing.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total clients" value={String(rows.length)} />
        <StatCard label="Active this week" value={String(activeThisWeekCount)} />
        <StatCard label="Exercises completed" value={String(submissionCount ?? 0)} />
        <StatCard
          label="Avg. mood trend"
          value={avgMood !== null ? `${avgMood.toFixed(1)} / 10` : "—"}
        />
      </div>

      <div className="mt-6 glass rounded-2xl p-6">
        <h3 className="text-base font-semibold">Client engagement</h3>
        <p className="mb-2 text-xs text-navy-500/50">Exercises completed per day, last 14 days</p>
        <EngagementChart data={days} />
      </div>

      <div className="mt-6 glass rounded-2xl p-6">
        <h3 className="mb-4 text-base font-semibold">Clients</h3>
        {rows.length === 0 ? (
          <p className="text-sm text-navy-500/60">
            No clients yet. Add one from the seed script, or build the "Add
            Client" flow next.
          </p>
        ) : (
          <ClientTable rows={rows} />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-wide text-navy-500/50">{label}</div>
      <div className="font-display mt-1 text-3xl text-navy-600">{value}</div>
    </div>
  );
}
