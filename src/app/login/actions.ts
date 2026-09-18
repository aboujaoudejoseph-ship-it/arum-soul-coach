"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { usernameToLoginEmail } from "@/lib/username";

export interface LoginState {
  error?: string;
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Please enter your username and password." };
  }

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToLoginEmail(username),
    password,
  });

  if (error || !data.user) {
    return { error: "Those credentials didn't work. Please try again." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "coach") {
    redirect("/admin");
  }
  if (profile?.role === "client") {
    redirect("/app");
  }

  return { error: "This account has no role assigned yet. Contact your coach." };
}
