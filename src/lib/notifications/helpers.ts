import { db } from "@/lib/db";

export async function actorDisplayName(userId: string): Promise<string> {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });
  if (!u) return "IT Arena";
  return `${u.firstName} ${u.lastName}`.trim() || "IT Arena";
}

export function excerpt(body: string, max = 120): string {
  const t = body.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
