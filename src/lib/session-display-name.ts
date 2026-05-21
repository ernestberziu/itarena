/** Display name for header / nav when session.user.name is missing or placeholder. */
export function sessionDisplayName(user: {
  name?: string | null;
  email?: string | null;
}): string | null {
  const full = user.name?.trim();
  if (full && full !== "-" && full !== "—") return full;

  const email = user.email?.trim();
  if (email) {
    const local = email.split("@")[0]?.trim();
    if (local) return local;
  }

  return null;
}
