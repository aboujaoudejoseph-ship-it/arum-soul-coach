/**
 * Seeds a demo coach, two demo clients, the exercise library, and a handful
 * of sample submissions/mood check-ins so the dashboards aren't empty.
 *
 * Run with: npm run seed
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (the service role key is required because creating auth users needs admin rights).
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { usernameToLoginEmail } from "../src/lib/username";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EXERCISES = [
  {
    slug: "gratitude-jar",
    title: "Gratitude Jar",
    description: "Drop a daily gratitude note into your 3D jar.",
    icon: "gem",
  },
  {
    slug: "wheel-of-life",
    title: "Wheel of Life",
    description: "Rate 8 life areas and see your balance at a glance.",
    icon: "pie-chart",
  },
  {
    slug: "self-love-worksheet",
    title: "Self-Love Worksheet",
    description: "A guided multi-step reflection on how you see yourself.",
    icon: "heart",
  },
  {
    slug: "mirror-exercise",
    title: "Mirror Exercise",
    description: "Turn negative self-talk into kinder, truer statements.",
    icon: "sparkles",
  },
  {
    slug: "confidence-builder",
    title: "Confidence Builder",
    description: "Map your strengths, proud moments, and support system.",
    icon: "star",
  },
  {
    slug: "gratitude-joy-happiness",
    title: "Gratitude, Joy & Happiness",
    description: "Twelve short prompts across three feel-good themes.",
    icon: "smile",
  },
  {
    slug: "daily-journal",
    title: "Daily Journal",
    description: "Free-write with a fresh prompt every day.",
    icon: "book-open",
  },
];

async function upsertExercises() {
  const { data, error } = await admin
    .from("exercises")
    .upsert(EXERCISES, { onConflict: "slug" })
    .select();
  if (error) throw error;
  console.log(`✓ ${data.length} exercises upserted`);
  return data;
}

async function findUserByUsername(username: string) {
  const email = usernameToLoginEmail(username);
  // paginate defensively; fine for a small demo project
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

async function ensureUser(opts: {
  username: string;
  password: string;
  name: string;
  role: "coach" | "client";
  coach_id?: string;
}) {
  const existing = await findUserByUsername(opts.username);
  if (existing) {
    console.log(`  · ${opts.username} already exists, reusing`);
    return existing.id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: usernameToLoginEmail(opts.username),
    password: opts.password,
    email_confirm: true,
    user_metadata: {
      role: opts.role,
      name: opts.name,
      username: opts.username,
      coach_id: opts.coach_id ?? "",
    },
  });
  if (error) throw error;
  console.log(`  ✓ created ${opts.role} ${opts.username}`);
  return data.user.id;
}

async function main() {
  console.log("Seeding exercises…");
  const exercises = await upsertExercises();
  const bySlug = Object.fromEntries(exercises.map((e) => [e.slug, e.id]));

  console.log("Seeding coach…");
  const coachId = await ensureUser({
    username: "natalieantoun",
    password: "demo123",
    name: "Natalie Antoun",
    role: "coach",
  });

  console.log("Seeding clients…");
  const clientAId = await ensureUser({
    username: "mayachen",
    password: "demo123",
    name: "Maya Chen",
    role: "client",
    coach_id: coachId,
  });
  const clientBId = await ensureUser({
    username: "jordanreyes",
    password: "demo123",
    name: "Jordan Reyes",
    role: "client",
    coach_id: coachId,
  });

  // Give the profile rows (created by the DB trigger) a moment to land.
  await new Promise((r) => setTimeout(r, 500));

  console.log("Assigning exercises…");
  const assignments = [
    clientAId,
    clientBId,
  ].flatMap((clientId) =>
    ["gratitude-jar", "wheel-of-life", "self-love-worksheet", "daily-journal"].map(
      (slug) => ({
        client_id: clientId,
        exercise_id: bySlug[slug],
        assigned_by: coachId,
        locked: false,
      })
    )
  );
  const { error: aErr } = await admin
    .from("assignments")
    .upsert(assignments, { onConflict: "client_id,exercise_id" });
  if (aErr) throw aErr;

  console.log("Adding sample submissions & mood check-ins…");
  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  const submissions = [
    {
      client_id: clientAId,
      exercise_id: bySlug["gratitude-jar"],
      payload: { note: "My morning coffee on the porch." },
      created_at: daysAgo(1),
    },
    {
      client_id: clientAId,
      exercise_id: bySlug["wheel-of-life"],
      payload: {
        health: 6, career: 7, finances: 5, personal_growth: 8,
        fun: 6, relationships: 7, spirituality: 4, environment: 6,
      },
      created_at: daysAgo(3),
    },
    {
      client_id: clientBId,
      exercise_id: bySlug["daily-journal"],
      payload: { entry: "Today I noticed I was kinder to myself when I made a mistake." },
      created_at: daysAgo(2),
    },
  ];
  const { error: sErr } = await admin.from("submissions").insert(submissions);
  if (sErr) throw sErr;

  const moods = [
    { client_id: clientAId, emotion: "joyful", date: daysAgo(1).slice(0, 10) },
    { client_id: clientAId, emotion: "calm", date: daysAgo(2).slice(0, 10) },
    { client_id: clientBId, emotion: "hopeful", date: daysAgo(1).slice(0, 10) },
  ];
  const { error: mErr } = await admin
    .from("mood_checkins")
    .upsert(moods, { onConflict: "client_id,date" });
  if (mErr) throw mErr;

  const { error: stErr } = await admin
    .from("streaks")
    .upsert(
      [
        { client_id: clientAId, current: 3, longest: 5, last_activity_date: daysAgo(1).slice(0, 10) },
        { client_id: clientBId, current: 1, longest: 2, last_activity_date: daysAgo(1).slice(0, 10) },
      ],
      { onConflict: "client_id" }
    );
  if (stErr) throw stErr;

  console.log("\nDone! Demo logins (username / password):");
  console.log("  Coach:   natalieantoun / demo123");
  console.log("  Client:  mayachen / demo123");
  console.log("  Client:  jordanreyes / demo123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
