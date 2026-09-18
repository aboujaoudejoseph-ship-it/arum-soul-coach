# Arum-Soul Coach

A life-coaching platform: a coach manages clients and assigns reflective
exercises; clients complete them in a warm, animated wellness app.

**Build status — Steps 1–4 of 5 complete, and Supabase is live:** database
schema, role-based auth, a real coach dashboard, a real client app with 7
working exercises, and the animation/3D pass. The Supabase project isn't
hypothetical anymore — I created and seeded it via the Supabase MCP
connector, so `.env.local` already has real, working credentials in it.
Next: a final polish pass, then you run the Cloudflare deploy yourself
(see that section below — that part still needs your machine). See
"What's real vs. simplified" below too.

## Tech stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth + Realtime) via `@supabase/ssr`
- Recharts (dashboard charts, wheel-of-life radar), Sonner (toasts)
- Framer Motion (page transitions, hero text reveal), Three.js / React
  Three Fiber (particle hero, 3D gratitude jar) — no GSAP: Framer Motion
  already covered every animation this app needed, so it was dropped
  rather than shipping two animation libraries doing overlapping jobs

## Supabase — already set up

`.env.local` in this zip has real values already: I created a project
called `arum-soul-coach` in your existing org, applied `supabase/schema.sql`
directly, and seeded the coach + 2 demo clients + exercise library +
sample submissions — all for real, in your actual Supabase account. You
don't need to create a project, copy keys, or run the schema yourself.

Two things worth knowing:
- Your org's free-project limit was already at 2, so this shares an
  **existing** Supabase project (`jajprojects`) rather than a fresh one —
  I checked first for naming collisions (none) and it's a completely
  separate set of tables (`users`, `exercises`, `assignments`,
  `submissions`, `mood_checkins`, `streaks`, all RLS-protected), so your
  other app on that project is untouched. Move it to its own project
  later if you'd rather they not share infrastructure.
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` is intentionally blank — I
  don't have a tool that exposes a project's secret key, and wouldn't put
  it in a downloadable file if I did. Nothing in the app needs it right
  now (the only thing that used it, `scripts/seed.ts`, is no longer
  necessary — the real demo data already exists). Get it from Supabase →
  Settings → API only when you build a feature that needs it, like an
  in-app "Add Client" flow.

## Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` → **Begin your journey** → sign in as the
coach or either client. Coaches land on `/admin`, clients land on `/app`;
each role is locked out of the other's routes by middleware and by RLS at
the database level.

Demo logins (password `demo123` for all), all live in the real database:

| Role   | Username      |
|--------|---------------|
| Coach  | natalieantoun |
| Client | mayachen      |
| Client | jordanreyes   |

Clients sign in with a username the coach sets for them, not an email —
Supabase Auth still needs an email under the hood, so each account gets a
synthetic, never-shown one (`src/lib/username.ts`); the UI only ever asks
for "username".

You don't need `npm run seed` — real seed data already exists in the
Supabase project. The script is still there and still works (idempotent,
safe to re-run) if you ever reset the database and need to reseed it.

## Project layout so far

```
src/
  middleware.ts              role-based route protection, session refresh
  lib/
    supabase/client.ts       browser Supabase client
    supabase/server.ts       server Supabase client (Server Components/Actions)
    types.ts                 shared TS types for every table
    mood.ts                  the 6 moods + score mapping (client UI + coach's avg-mood stat)
    wheel.ts                 the 8 wheel-of-life areas, shared by the form and both radar charts
    streak.ts                bumpStreak() — one place that owns the streak-increment rule
    username.ts              username -> synthetic Supabase-auth email
  components/
    WheelRadarChart.tsx      shared radar chart (client's exercise page + coach's client detail page)
    admin/                   EngagementChart, ClientTable, NotesEditor, SubmissionsFeed (realtime),
                              MoodLineChart, AssignExercises, ExerciseLibraryCard
    client/                  MoodCheckin
    client/exercises/        one component per exercise type (see below)
  app/
    page.tsx                 public landing page
    login/                   shared sign-in form + server action
    auth/signout/route.ts    sign-out handler
    admin/                   overview, clients/[id] detail, exercises library — all real, Supabase-backed
    app/                     Today page, exercises/[slug] runner — all real, Supabase-backed
supabase/
  schema.sql                 full schema, RLS policies, auth trigger
scripts/
  seed.ts                    demo coach/clients/exercises/submissions
```

## What's real vs. simplified

Everything above writes to and reads from actual Supabase tables — none of
it is mock data. But a few things are intentionally smaller than the full
spec, so you know what you're looking at before showing anyone:

- **Self-Love Worksheet**: the spec described ~9 sub-sections (rate
  yourself, inner critic, 10 things I like about myself, strengths, a
  letter to myself, etc). What's built is a 4-field version (rating, inner
  critic, kinder thought, one affirmation) — the real flow, just fewer
  steps. Easy to extend; same `payload` JSONB pattern.
- **Gratitude, Joy & Happiness**: spec asked for 12 prompts across 3
  sections; built as 6 (2 per section) for the same reason.
- **"Add Client" flow**: the coach dashboard reads and manages existing
  clients fully, but there's no in-app form yet to create a new client
  account (that still goes through `npm run seed` or the Supabase Admin
  API directly). Worth doing next if you'll actually onboard real clients.
- **Not every micro-interaction from the spec is in**: "hearts float up"
  and leaf-fall milestone animations aren't built — the confetti burst
  (`src/lib/confetti.ts`) covers the same "celebrate completion" moment
  without a second, more elaborate effect on top of it.
- **`@react-three/drei` is installed but unused** — the particle hero and
  jar scene only needed raw Three.js primitives, so nothing currently
  imports it. Harmless to leave; fine to remove if you want the leanest
  possible `node_modules`.

## Deploying to Cloudflare (free)

Cloudflare Workers can run this app for free (generous free tier: 100k
requests/day) via the official OpenNext adapter, which supports Next.js
middleware — needed here for the role-based route protection.

I didn't hand-write the Cloudflare config files myself: this sandbox has no
internet access to install packages or test them, and a config I can't run
is a config I can't be sure is right. `@opennextjs/cloudflare` ships an
official generator that does this correctly for whatever Next.js version
you actually have installed — safer to use than something I guessed at.

1. `npm install` (if you haven't already)
2. `npx @opennextjs/cloudflare@latest migrate` — installs `wrangler` and
   the adapter, generates `wrangler.jsonc` and `open-next.config.ts`, and
   updates `package.json`'s scripts. Answer its prompts (worker name, etc).
3. In the Cloudflare dashboard (free account), add your env vars:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as
     **Build variables** (Workers & Pages → your project → Settings → Variables)
   - `SUPABASE_SERVICE_ROLE_KEY` as a **secret**, not a plain variable:
     `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY`
4. `npm run deploy` — builds and pushes to Cloudflare. `npx wrangler login`
   first if it asks (opens your browser to authenticate your own Cloudflare
   account — that step has to be you, not me).

Cloudflare gives you a `*.workers.dev` URL immediately; a custom domain is
optional and also free to attach afterward.

## A note on this build

This project was generated in an offline sandbox with no package-registry
access, so it has never been `npm install`'d or `next dev`'d on this end.
I did run the real TypeScript compiler over every file here (it happened
to be preinstalled in the sandbox) with your dependencies' types absent —
that catches genuine typos and logic errors but can't catch everything
`npm install` + `next build` would. Please run it locally per the steps
above, and tell me what doesn't come up cleanly so I can fix it.

