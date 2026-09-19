"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { usernameToLoginEmail } from "@/lib/username";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

      if (!username.trim() || !password) {
              setError("Please enter your username and password.");
              return;
      }

      setPending(true);
        const supabase = createClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
              email: usernameToLoginEmail(username),
              password,
      });

      if (signInError || !data.user) {
              setError("Those credentials didn't work. Please try again.");
              setPending(false);
              return;
      }

      const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

      if (profile?.role === "coach") {
              window.location.href = "/admin";
      } else if (profile?.role === "client") {
              window.location.href = "/app";
      } else {
              setError("This account has no role assigned yet. Contact your coach.");
              setPending(false);
      }
  }

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
              
                      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                                <div>
                                            <label className="mb-1 block text-sm text-navy-500/80">Username</label>
                                            <input
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            type="text"
                                                            autoComplete="username"
                                                            className="w-full rounded-xl border border-blush-200 bg-white/70 px-4 py-2.5 outline-none focus:border-blush-400"
                                                            placeholder="mayachen"
                                                          />
                                </div>
                                <div>
                                            <label className="mb-1 block text-sm text-navy-500/80">Password</label>
                                            <input
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            type="password"
                                                            autoComplete="current-password"
                                                            className="w-full rounded-xl border border-blush-200 bg-white/70 px-4 py-2.5 outline-none focus:border-blush-400"
                                                            placeholder="password"
                                                          />
                                </div>
                      
                        {error && (
                      <p className="rounded-lg bg-blush-100 px-3 py-2 text-sm text-blush-600">
                        {error}
                      </p>
                                )}
                      
                                <button
                                              type="submit"
                                              disabled={pending}
                                              className="w-full rounded-full bg-navy-600 py-3 font-medium text-cream-50 shadow-glow transition hover:bg-navy-500 disabled:opacity-60"
                                            >
                                  {pending ? "Signing in" : "Sign in"}
                                </button>
                      </form>
              
                      <p className="mt-6 text-center text-xs text-navy-500/50">
                                Demo accounts, password demo123 for both:
                                <br />
                                natalieantoun (coach) or mayachen (client)
                      </p>
              </div>
        </main>
      );
}
</main>
