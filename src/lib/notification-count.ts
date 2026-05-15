import { db } from "@/lib/db";

/**
 * Returns unread notification count; on DB errors returns 0 so admin shells still render.
 * Does not use console.error — Next.js dev forwards that to the browser as a red overlay.
 */
export async function countUnreadNotifications(userId: string): Promise<number> {
  try {
    return await db.notification.count({
      where: { userId, readAt: null },
    });
  } catch {
    return 0;
  }
}
