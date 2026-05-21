"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ADMIN_FEATURES,
  ROLE_DEFAULT_ACL,
  type AdminFeature,
  type AclLevel,
  type StaffRole,
} from "@/lib/admin-acl/features";

type Cell = AclLevel | "inherit";

function parseOverlay(raw: unknown): Partial<Record<AdminFeature, AclLevel>> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Partial<Record<AdminFeature, AclLevel>> = {};
  for (const f of ADMIN_FEATURES) {
    const v = (raw as Record<string, unknown>)[f];
    if (v === "none" || v === "read" || v === "write") out[f] = v;
  }
  return out;
}

function initialCell(
  f: AdminFeature,
  overlay: Partial<Record<AdminFeature, AclLevel>>,
  role: StaffRole
): Cell {
  if (overlay[f] !== undefined) return overlay[f]!;
  return "inherit";
}

export function AdminStaffAclEditor({
  staffId,
  staffRole,
  initialAdminAclJson,
  locale,
}: {
  staffId: string;
  staffRole: StaffRole;
  initialAdminAclJson: unknown;
  locale: string;
}) {
  const router = useRouter();
  const en = locale === "en";
  const t = (sq: string, e: string) => (en ? e : sq);

  const defaults = ROLE_DEFAULT_ACL[staffRole];

  const [levels, setLevels] = useState<Record<AdminFeature, Cell>>(() => {
    const ov = parseOverlay(initialAdminAclJson);
    const init = {} as Record<AdminFeature, Cell>;
    for (const f of ADMIN_FEATURES) {
      init[f] = initialCell(f, ov, staffRole);
    }
    return init;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ov = parseOverlay(initialAdminAclJson);
    const next = {} as Record<AdminFeature, Cell>;
    for (const f of ADMIN_FEATURES) {
      next[f] = initialCell(f, ov, staffRole);
    }
    setLevels(next);
  }, [initialAdminAclJson, staffRole]);

  if (staffRole === "ADMIN") {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
        {t(
          "Administratorët kanë qasje të plotë; ACL nuk zbatohet për këtë rol.",
          "Administrators have full access; ACL does not apply to this role."
        )}
      </div>
    );
  }

  function setLevel(f: AdminFeature, v: Cell) {
    setLevels((prev) => ({ ...prev, [f]: v }));
  }

  async function save() {
    const out: Record<string, AclLevel> = {};
    for (const f of ADMIN_FEATURES) {
      const v = levels[f];
      if (v === "inherit") continue;
      if (v === defaults[f]) continue;
      out[f] = v;
    }
    const adminAclJson = Object.keys(out).length > 0 ? out : null;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminAclJson }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      toast.success(t("Lejet u përditësuan", "Permissions updated"));
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Gabim", "Error"));
    } finally {
      setLoading(false);
    }
  }

  const label = (f: AdminFeature) =>
    f === "pos_sale"
      ? t("POS — shitje në dyqan", "POS — in-store sale")
      : f === "shop_products"
        ? t("Produkte dyqani", "Shop products")
        : f === "shop_orders"
          ? t("Porosi dyqani", "Shop orders")
          : f === "view_shop"
            ? t("Shiko dyqanin", "View shop")
            : f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, " ");

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{t("Lejet (ACL)", "Permissions (ACL)")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(
            "Trashëgimi = roli i paracaktuar. Zgjidh nivelin për të mbishkruar.",
            "Inherit = role default. Pick a level to override."
          )}
        </p>
      </div>

      <div className="max-h-[min(60vh,480px)] overflow-auto rounded-lg border border-border/50">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur">
            <tr className="border-b border-border/60">
              <th className="px-3 py-2 font-medium">{t("Zona", "Area")}</th>
              <th className="px-3 py-2 font-medium">{t("Parazgjedhje", "Default")}</th>
              <th className="px-3 py-2 font-medium">{t("Mbishkrim", "Override")}</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_FEATURES.map((f) => (
              <tr key={f} className="border-b border-border/40 last:border-0">
                <td className="px-3 py-2 align-middle">{label(f)}</td>
                <td className="px-3 py-2 align-middle font-mono text-xs text-muted-foreground">{defaults[f]}</td>
                <td className="px-3 py-2 align-middle">
                  <Label className="sr-only" htmlFor={`acl-${f}`}>
                    {f}
                  </Label>
                  <Select value={levels[f]} onValueChange={(v) => setLevel(f, v as Cell)}>
                    <SelectTrigger id={`acl-${f}`} className="h-9 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inherit">{t("Trashëgim", "Inherit")}</SelectItem>
                      <SelectItem value="none">none</SelectItem>
                      <SelectItem value="read">read</SelectItem>
                      <SelectItem value="write">write</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" onClick={() => void save()} disabled={loading}>
        {t("Ruaj lejet", "Save permissions")}
      </Button>
    </div>
  );
}
