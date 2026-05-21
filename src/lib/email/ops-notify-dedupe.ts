/**
 * When several ADMINs get the same in-app notification, send only one email
 * to NOTIFY_EMAIL within a short window (albvisa-web pattern).
 */
const recent = new Map<string, number>();
const WINDOW_MS = 5000;
const MAX_KEYS = 400;

export function shouldSendOpsNotifyEmail(dedupeKey: string): boolean {
  const now = Date.now();
  const prev = recent.get(dedupeKey);
  if (prev !== undefined && now - prev < WINDOW_MS) {
    return false;
  }
  recent.set(dedupeKey, now);
  if (recent.size > MAX_KEYS) {
    for (const [k, t] of recent) {
      if (now - t >= WINDOW_MS) recent.delete(k);
    }
  }
  return true;
}

export function opsNotifyDedupeKey(input: {
  type: string;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  link?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  dedupeKey?: string | null;
}): string {
  if (input.dedupeKey) return `batch:${input.dedupeKey}`;
  const body = (input.body || input.bodyEn || "").slice(0, 240);
  return [
    input.type,
    input.title,
    input.titleEn,
    body,
    input.link ?? "",
    input.entityType ?? "",
    input.entityId ?? "",
  ].join("|");
}
