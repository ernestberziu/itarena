export type CommentAuthorLike =
  | {
      id?: string;
      firstName: string;
      lastName: string;
      role: string;
    }
  | null
  | undefined;

export function resolveCommentAuthor(
  author: CommentAuthorLike,
  guestAuthorName: string | null | undefined,
  locale: "sq" | "en" = "sq"
): { displayName: string; initials: string; isGuest: boolean } {
  if (guestAuthorName?.trim()) {
    const name = guestAuthorName.trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const initials =
      parts.length >= 2
        ? `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase()
        : (name[0] ?? "?").toUpperCase();
    return { displayName: name, initials, isGuest: true };
  }
  if (!author) {
    return {
      displayName: locale === "sq" ? "Klient" : "Client",
      initials: "K",
      isGuest: false,
    };
  }
  const displayName = `${author.firstName} ${author.lastName}`.trim();
  const initials =
    `${author.firstName[0] ?? ""}${author.lastName[0] ?? ""}`.toUpperCase() || "?";
  return { displayName, initials, isGuest: false };
}
