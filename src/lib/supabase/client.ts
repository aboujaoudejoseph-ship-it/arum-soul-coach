"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (safe to use in client components).
 * Deliberately untyped against our hand-written Database interface: that
 * type doesn't model table relationships, so it fights the type checker on
 * every joined select (e.g. assignments -> exercises) without a real
 * payoff. src/lib/types.ts is still the source of truth for row shapes —
 * use those types directly where you need them.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
