"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

export function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const sigRes = await fetch("/api/admin/site/upload-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType: file.type || "image/jpeg",
            extension: file.name.includes(".") ? file.name.split(".").pop() : undefined,
          }),
        });
        const sigData = (await sigRes.json()) as {
          error?: string;
          uploadUrl?: string;
          uploadFields?: Record<string, string>;
          fileUrl?: string;
        };
        if (!sigRes.ok) throw new Error(sigData.error || "Signature failed");
        const { uploadUrl, uploadFields, fileUrl } = sigData;
        if (!uploadUrl || !uploadFields) throw new Error("Invalid signature");

        const fd = new FormData();
        for (const [k, v] of Object.entries(uploadFields)) fd.append(k, v);
        fd.append("file", file);

        const upRes = await fetch(uploadUrl, { method: "POST", body: fd });
        const upJson = (await upRes.json()) as { secure_url?: string };
        const url = upJson.secure_url || fileUrl;
        if (!url) throw new Error("Upload failed");
        onChange(url);
        toast.success("Image uploaded");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void upload(file);
          }}
        />
        <Button type="button" variant="outline" size="icon" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" />
        </Button>
        {value ? (
          <Button type="button" variant="outline" size="icon" onClick={() => onChange("")}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-2 h-20 w-auto rounded-md border object-cover" />
      ) : null}
    </div>
  );
}
