"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Maximize2 } from "lucide-react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

function filterFullscreenCommand(command: { name?: string }) {
  if (command.name === "fullscreen") return false;
  return command;
}

function MarkdownEditorPane({
  value,
  onChange,
  height,
  enabled,
}: {
  value: string;
  onChange: (v: string) => void;
  height: number;
  enabled: boolean;
}) {
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  const handleChange = useCallback((v: string | undefined) => {
    if (!enabled) return;
    const next = v ?? "";
    if (next === valueRef.current) return;
    onChangeRef.current(next);
  }, [enabled]);

  if (!enabled) {
    return (
      <div
        className="rounded-b-xl bg-muted/20"
        style={{ height }}
        aria-hidden
      />
    );
  }

  return (
    <MDEditor
      value={value}
      onChange={handleChange}
      height={height}
      preview="live"
      commandsFilter={filterFullscreenCommand}
    />
  );
}

export function ContractMarkdownEditor({
  value,
  onChange,
  height = 360,
  title,
  fullscreenLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  height?: number;
  title?: string;
  fullscreenLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [fullscreenHeight, setFullscreenHeight] = useState(600);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    setEditorReady(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const update = () => setFullscreenHeight(Math.max(320, window.innerHeight - 88));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  return (
    <>
      <div data-color-mode="light" className="rounded-xl border border-border/50">
        <div className="flex items-center justify-end gap-2 border-b border-border/40 px-2 py-1">
          {title ? (
            <p className="mr-auto truncate text-xs font-medium text-muted-foreground">{title}</p>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 shrink-0 gap-1.5 text-xs text-muted-foreground"
            onClick={() => setOpen(true)}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            {fullscreenLabel}
          </Button>
        </div>
        <MarkdownEditorPane
          value={value}
          onChange={onChange}
          height={height}
          enabled={editorReady}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "fixed inset-0 flex h-dvh w-screen max-w-none flex-col gap-0 rounded-none p-0",
            "top-0 left-0 translate-x-0 translate-y-0 sm:max-w-none"
          )}
        >
          <DialogHeader className="shrink-0 border-b border-border/50 px-4 py-3 pr-12">
            <DialogTitle className="text-sm font-semibold">
              {title ?? fullscreenLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-hidden p-4" data-color-mode="light">
            <MarkdownEditorPane
              value={value}
              onChange={onChange}
              height={fullscreenHeight}
              enabled={editorReady && open}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
