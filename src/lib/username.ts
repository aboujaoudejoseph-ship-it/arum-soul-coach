/**
 * Supabase Auth only accepts an email/phone as the identity field — there's
 * no separate "username" login mode. Rather than build a parallel auth
 * system, we derive a stable, fake-but-valid email from the username and
 * use that internally. Nobody ever sees this value; the UI only shows
 * "username".
 */
export function usernameToLoginEmail(username: string): string {
  const slug = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return `${slug}@users.arum-soul.app`;
}
