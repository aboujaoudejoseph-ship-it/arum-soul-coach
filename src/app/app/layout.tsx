import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ClientAppLayout({
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
    .select("name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-10 flex items-center justify-between px-6 py-4">
        <span className="font-display text-xl text-navy-600">Arum-Soul</span>
        <div className="flex items-center gap-4 text-sm text-navy-500/70">
          <span>Hi, {profile?.name?.split(" ")[0]}</span>
          <form action="/auth/signout" method="post">
            <button className="rounded-full border border-navy-500/20 px-4 py-1.5 hover:bg-navy-500/5">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
