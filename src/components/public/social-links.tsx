import type { SocialLink } from "@/lib/site-content/types";
import { cn } from "@/lib/utils";
import { SocialNetworkIcon, SOCIAL_NETWORK_LABELS } from "./social-network-icon";

export function getActiveSocialLinks(links: SocialLink[] | undefined): SocialLink[] {
  return (links ?? []).filter((link) => link.enabled && link.url.trim().length > 0);
}

export function SocialLinks({
  links,
  className,
  iconClassName,
  size = "md",
  variant = "footer",
}: {
  links: SocialLink[] | undefined;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md";
  variant?: "footer" | "light";
}) {
  const active = getActiveSocialLinks(links);
  if (active.length === 0) return null;

  const buttonSize = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {active.map((link) => (
        <a
          key={link.network}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={SOCIAL_NETWORK_LABELS[link.network]}
          className={cn(
            "inline-flex items-center justify-center rounded-full border transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            variant === "footer"
              ? "border-white/10 bg-white/5 text-slate-300 hover:border-primary/40 hover:bg-primary/15 hover:text-white focus-visible:ring-offset-[hsl(222,47%,9%)]"
              : "border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/35 hover:bg-primary/10 hover:text-primary focus-visible:ring-offset-background",
            buttonSize
          )}
        >
          <SocialNetworkIcon network={link.network} className={cn(iconSize, iconClassName)} />
        </a>
      ))}
    </div>
  );
}
