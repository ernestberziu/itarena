"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { isAllowedOverlayImageUrl, SHOP_OVERLAY_MAX_IMAGES } from "@/lib/shop-product-overlay";
import type { AdminCatalogRow } from "@/components/admin/admin-catalog-types";

type Props = {
  row: AdminCatalogRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
};

export function AdminCatalogProductEditSheet({ row, open, onOpenChange, locale }: Props) {
  const router = useRouter();
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);

  const [images, setImages] = useState<string[]>([]);
  const [descriptionSq, setDescriptionSq] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!row || !open) return;
    try {
      const parsed = JSON.parse(row.imagesJson) as unknown;
      setImages(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []);
    } catch {
      setImages([]);
    }
    setDescriptionSq(row.overlayDescriptionSq ?? "");
    setDescriptionEn(row.overlayDescriptionEn ?? "");
  }, [row, open]);

  const removeImage = useCallback((url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
  }, []);

  const moveImage = useCallback((index: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = index + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[index]!;
      copy[index] = copy[next]!;
      copy[next] = tmp;
      return copy;
    });
  }, []);

  const onPickFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !row) return;
      if (!file.type.startsWith("image/")) {
        toast.error(t("Zgjidh një skedar figure.", "Pick an image file."));
        return;
      }
      if (images.length >= SHOP_OVERLAY_MAX_IMAGES) {
        toast.error(t(`Maksimumi është ${SHOP_OVERLAY_MAX_IMAGES} figura.`, `Maximum is ${SHOP_OVERLAY_MAX_IMAGES} images.`));
        return;
      }
      setUploading(true);
      try {
        const sigRes = await fetch("/api/admin/catalog/upload-signature", {
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
        if (!sigRes.ok) {
          throw new Error(sigData.error || "Signature failed");
        }
        const { uploadUrl, uploadFields, fileUrl } = sigData;
        if (!uploadUrl || !uploadFields) throw new Error("Invalid signature response");

        const fd = new FormData();
        for (const [k, v] of Object.entries(uploadFields)) {
          fd.append(k, v);
        }
        fd.append("file", file);

        const upRes = await fetch(uploadUrl, { method: "POST", body: fd });
        const upJson = (await upRes.json()) as { secure_url?: string; error?: { message?: string } };
        if (!upRes.ok) {
          throw new Error(upJson.error?.message || "Cloudinary upload failed");
        }
        const url =
          typeof upJson.secure_url === "string" && isAllowedOverlayImageUrl(upJson.secure_url)
            ? upJson.secure_url
            : fileUrl && isAllowedOverlayImageUrl(fileUrl)
              ? fileUrl
              : null;
        if (!url) {
          throw new Error(t("URL e pavlefshme nga Cloudinary.", "Invalid URL from Cloudinary."));
        }
        setImages((prev) => [...prev, url]);
        toast.success(t("Figura u ngarkua.", "Image uploaded."));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("Ngarkimi dështoi.", "Upload failed."));
      } finally {
        setUploading(false);
      }
    },
    [images.length, row, t]
  );

  const onSave = useCallback(async () => {
    if (!row) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/catalog/products/${encodeURIComponent(row.sku)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          descriptionSq: descriptionSq.trim() || null,
          descriptionEn: descriptionEn.trim() || null,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }
      toast.success(t("Ruajtja u krye.", "Saved."));
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("Ruajtja dështoi.", "Save failed."));
    } finally {
      setSaving(false);
    }
  }, [descriptionEn, descriptionSq, images, onOpenChange, row, router, t]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {t("Ndrysho pamjen e produktit", "Edit product presentation")}
          </SheetTitle>
          <SheetDescription>
            {row
              ? t(
                  `SKU: ${row.sku} — vetëm figura (Cloudinary) dhe përshkrimi ruhen në databazë; çmimet dhe stoku vijnë nga Financa5.`,
                  `SKU: ${row.sku} — only images (Cloudinary) and descriptions are stored in the database; prices and stock come from Financa5.`
                )
              : null}
          </SheetDescription>
        </SheetHeader>

        {row ? (
          <div className="flex flex-col gap-6 px-4 pb-4">
            <div className="space-y-2">
              <Label>{t("Figurat", "Images")}</Label>
              <p className="text-xs text-muted-foreground">
                {t(`Deri në ${SHOP_OVERLAY_MAX_IMAGES} URL nga Cloudinary.`, `Up to ${SHOP_OVERLAY_MAX_IMAGES} Cloudinary URLs.`)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" disabled={uploading || images.length >= SHOP_OVERLAY_MAX_IMAGES} asChild>
                  <label className="cursor-pointer">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    <span className="ml-1.5">{t("Shto figurë", "Add image")}</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={onPickFile} disabled={uploading} />
                  </label>
                </Button>
              </div>
              <ul className="space-y-2">
                {images.map((url, i) => (
                  <li
                    key={`${url}-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 p-2"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-background">
                      <Image src={url} alt="" fill className="object-cover" sizes="56px" unoptimized />
                    </div>
                    <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground" title={url}>
                      {url}
                    </span>
                    <div className="flex shrink-0 flex-col gap-0.5">
                      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => moveImage(i, -1)} disabled={i === 0}>
                        <ChevronUp className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveImage(i, 1)}
                        disabled={i === images.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeImage(url)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t("Hiq", "Remove")}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-desc-sq">{t("Përshkrimi (SQ)", "Description (SQ)")}</Label>
              <Textarea
                id="cat-desc-sq"
                value={descriptionSq}
                onChange={(e) => setDescriptionSq(e.target.value)}
                rows={5}
                placeholder={t("Lëreni bosh për të përdorur emrin nga Financa5.", "Leave empty to use the Financa5 name.")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc-en">{t("Përshkrimi (EN)", "Description (EN)")}</Label>
              <Textarea
                id="cat-desc-en"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                rows={5}
                placeholder={t("Lëreni bosh për të përdorur emrin nga Financa5.", "Leave empty to use the Financa5 name.")}
              />
            </div>
          </div>
        ) : null}

        <SheetFooter className="border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("Anulo", "Cancel")}
          </Button>
          <Button type="button" onClick={onSave} disabled={!row || saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("Ruaj", "Save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
