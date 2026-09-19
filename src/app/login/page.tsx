"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-navy-600 py-3 font-medium text-cream-50 shadow-glow transition hover:bg-navy-500 disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass w-full max-w-sm rounded-3xl p-8 shadow-xl">
        <Link href="/" className="text-xs uppercase tracking-[0.3em] text-navy-500/60">
          Arum-Soul Coach
        </Link>
        <h1 className="mt-3 font-display text-3xl text-navy-600">Welcome back</h1>
        <p className="mt-1 text-sm text-navy-500/70">
          Coaches and clients both sign in here.
        </p>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-navy-500/80">Username</label>
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-blush-200 bg-white/70 px-4 py-2.5 outline-none focus:border-blush-400"
              placeholder="mayachen"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-navy-500/80">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-blush-200 bg-white/70 px-4 py-2.5 outline-none focus:border-blush-400"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-blush-100 px-3 py-2 text-sm text-blush-600">
              {state?.error}
            </p>
          )}

          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-xs text-navy-500/50">
          Demo — natalieantoun / demo123
          <br />
          Demo — mayachen / demo123
        </p>
      </div>
    </main>
  );
}
