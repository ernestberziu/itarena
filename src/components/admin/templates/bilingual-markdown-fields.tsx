"use client";

import { cn } from "@/lib/utils";
import { ContractMarkdownEditor } from "./contract-markdown-editor";

export function BilingualMarkdownFields({
  activeLanguage,
  onLanguageChange,
  bodySq,
  bodyEn,
  onBodySqChange,
  onBodyEnChange,
  labels,
}: {
  activeLanguage: "sq" | "en";
  onLanguageChange: (lang: "sq" | "en") => void;
  bodySq: string;
  bodyEn: string;
  onBodySqChange: (v: string) => void;
  onBodyEnChange: (v: string) => void;
  labels: {
    tabSq: string;
    tabEn: string;
    editorSq: string;
    editorEn: string;
    editorFullscreen: string;
  };
}) {
  return (
    <div className="space-y-3">
      <div
        className="flex gap-1 rounded-xl bg-muted/50 p-1"
        role="tablist"
        aria-label={labels.tabSq}
      >
        {(
          [
            { key: "sq" as const, label: labels.tabSq },
            { key: "en" as const, label: labels.tabEn },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeLanguage === key}
            onClick={() => onLanguageChange(key)}
            className={cn(
              "flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeLanguage === key
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeLanguage === "sq" ? (
        <ContractMarkdownEditor
          value={bodySq}
          onChange={onBodySqChange}
          height={320}
          title={labels.editorSq}
          fullscreenLabel={labels.editorFullscreen}
        />
      ) : (
        <ContractMarkdownEditor
          value={bodyEn}
          onChange={onBodyEnChange}
          height={320}
          title={labels.editorEn}
          fullscreenLabel={labels.editorFullscreen}
        />
      )}
    </div>
  );
}
