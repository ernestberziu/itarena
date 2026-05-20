import { cn } from "@/lib/utils";

/** Opaque white modal/sheet surface for admin dialogs. */
export const adminWhiteDialogClassName = cn(
  "border-border/60 bg-white text-slate-900 shadow-xl backdrop-blur-none",
  "dark:bg-white dark:text-slate-900"
);

export const adminWhiteInputClassName = "bg-white text-slate-900 dark:bg-white dark:text-slate-900";
