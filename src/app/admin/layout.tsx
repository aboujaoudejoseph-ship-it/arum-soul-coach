import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="glass sticky top-0 z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-xl text-navy-600">
            Arum-Soul · Coach
          </span>
          <nav className="hidden gap-4 text-sm text-navy-500/70 sm:flex">
            <Link href="/admin" className="hover:text-navy-600">Overview</Link>
            <Link href="/admin/exercises" className="hover:text-navy-600">Exercise Library</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-navy-500/70">
          <span>{profile?.name}</span>
          <form action="/auth/signout" method="post">
            <button className="rounded-full border border-navy-500/20 px-4 py-1.5 hover:bg-navy-500/5">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
