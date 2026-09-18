-- =========================================================
-- Arum-Soul Coach — database schema (run in Supabase SQL editor)
-- Safe to re-run: uses "if not exists" / "or replace" where possible.
-- =========================================================

create extension if not exists "pgcrypto";

do $$ begin
  create type user_role as enum ('coach', 'client');
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------
-- users: profile row, 1:1 with an auth.users row (same id)
-- ---------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  name text not null,
  username text not null unique,
  email text not null unique, -- internal-only synthetic login email, never shown in UI
  coach_id uuid references public.users(id) on delete set null,
  avatar_url text,
  goals text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists users_coach_id_idx on public.users(coach_id);

-- ---------------------------------------------------------
-- exercises: the library the coach curates
-- ---------------------------------------------------------
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- assignments: which exercises a client currently has
-- ---------------------------------------------------------
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  assigned_by uuid references public.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  locked boolean not null default false,
  unique (client_id, exercise_id)
);

-- ---------------------------------------------------------
-- submissions: every completed exercise, freeform JSON payload
-- ---------------------------------------------------------
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists submissions_client_idx on public.submissions(client_id, created_at desc);

-- ---------------------------------------------------------
-- mood_checkins: one per client per day
-- ---------------------------------------------------------
create table if not exists public.mood_checkins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  emotion text not null,
  note text,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (client_id, date)
);

-- ---------------------------------------------------------
-- streaks: one row per client
-- ---------------------------------------------------------
create table if not exists public.streaks (
  client_id uuid primary key references public.users(id) on delete cascade,
  current int not null default 0,
  longest int not null default 0,
  last_activity_date date
);

-- =========================================================
-- Auto-provision a public.users row (+ streaks row) whenever
-- a new auth user is created. The coach dashboard / seed script
-- pass role, name and coach_id via user_metadata.
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, role, name, username, email, coach_id)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'client'),
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'username'),
    new.raw_user_meta_data->>'username',
    new.email,
    nullif(new.raw_user_meta_data->>'coach_id', '')::uuid
  );

  insert into public.streaks (client_id) values (new.id)
  on conflict (client_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.users enable row level security;
alter table public.exercises enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.mood_checkins enable row level security;
alter table public.streaks enable row level security;

-- helper: is the current user a coach?
create or replace function public.is_coach()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'coach'
  );
$$;

-- helper: does the given client belong to the current coach?
create or replace function public.is_own_client(client uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = client and coach_id = auth.uid()
  );
$$;

-- ---- users ----
drop policy if exists "users select own or coach's clients" on public.users;
create policy "users select own or coach's clients"
  on public.users for select
  using (id = auth.uid() or coach_id = auth.uid());

drop policy if exists "users update own or coach can update clients" on public.users;
create policy "users update own or coach can update clients"
  on public.users for update
  using (id = auth.uid() or coach_id = auth.uid());

-- ---- exercises ----
drop policy if exists "exercises readable by authenticated" on public.exercises;
create policy "exercises readable by authenticated"
  on public.exercises for select
  using (auth.uid() is not null);

drop policy if exists "exercises writable by coach" on public.exercises;
create policy "exercises writable by coach"
  on public.exercises for all
  using (public.is_coach())
  with check (public.is_coach());

-- ---- assignments ----
drop policy if exists "assignments select own or client's" on public.assignments;
create policy "assignments select own or client's"
  on public.assignments for select
  using (client_id = auth.uid() or public.is_own_client(client_id));

drop policy if exists "assignments write by coach" on public.assignments;
create policy "assignments write by coach"
  on public.assignments for all
  using (public.is_own_client(client_id))
  with check (public.is_own_client(client_id));

-- ---- submissions ----
drop policy if exists "submissions select own or client's" on public.submissions;
create policy "submissions select own or client's"
  on public.submissions for select
  using (client_id = auth.uid() or public.is_own_client(client_id));

drop policy if exists "submissions insert own" on public.submissions;
create policy "submissions insert own"
  on public.submissions for insert
  with check (client_id = auth.uid());

-- ---- mood_checkins ----
drop policy if exists "mood select own or client's" on public.mood_checkins;
create policy "mood select own or client's"
  on public.mood_checkins for select
  using (client_id = auth.uid() or public.is_own_client(client_id));

drop policy if exists "mood upsert own" on public.mood_checkins;
create policy "mood upsert own"
  on public.mood_checkins for all
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

-- ---- streaks ----
drop policy if exists "streaks select own or client's" on public.streaks;
create policy "streaks select own or client's"
  on public.streaks for select
  using (client_id = auth.uid() or public.is_own_client(client_id));

drop policy if exists "streaks update own" on public.streaks;
create policy "streaks update own"
  on public.streaks for update
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

-- =========================================================
-- Realtime: let the coach dashboard subscribe to live changes
-- =========================================================
alter publication supabase_realtime add table public.submissions;
alter publication supabase_realtime add table public.mood_checkins;
alter publication supabase_realtime add table public.assignments;
