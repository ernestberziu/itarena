import { cn } from "@/lib/utils";

export function UserAvatar({
  firstName,
  lastName,
  imageUrl,
  className,
  size = "md",
}: {
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const sizeCls =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
        ? "h-12 w-12 text-base"
        : "h-9 w-9 text-sm";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-background shadow-sm",
          sizeCls,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 font-semibold text-primary ring-2 ring-border/60 shadow-sm",
        sizeCls,
        className
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
