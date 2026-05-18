"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROJECT_ACCESS_LEVELS, type ProjectAccess } from "@/lib/projects/types";

type Assignment = {
  id: string;
  access: ProjectAccess;
  project: { id: string; title: string; status: string };
};

export function AdminStaffProjectAssignments({
  staffId,
  locale,
}: {
  staffId: string;
  locale: string;
}) {
  const en = locale === "en";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState("");
  const [access, setAccess] = useState<ProjectAccess>("read");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/staff/${staffId}/projects`);
        if (res.ok) {
          const data = await res.json();
          setAssignments(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [staffId]);

  async function addAssignment() {
    if (!projectId.trim()) return;
    const res = await fetch(`/api/admin/projects/${projectId.trim()}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: staffId, access }),
    });
    if (!res.ok) {
      toast.error(en ? "Failed to assign" : "Caktimi dështoi");
      return;
    }
    setProjectId("");
    toast.success(en ? "Project assigned" : "Projekti u caktua");
    const listRes = await fetch(`/api/admin/staff/${staffId}/projects`);
    if (listRes.ok) setAssignments(await listRes.json());
  }

  async function remove(memberId: string, pid: string) {
    const res = await fetch(`/api/admin/projects/${pid}/members?memberId=${memberId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error(en ? "Failed" : "Gabim");
      return;
    }
    setAssignments((a) => a.filter((x) => x.id !== memberId));
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-semibold">{en ? "Project access" : "Aksesi në projekte"}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {en
            ? "Projects this staff member can view or manage."
            : "Projektet që ky anëtar stafi mund të shohë ose menaxhojë."}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{en ? "Loading…" : "Duke ngarkuar…"}</p>
      ) : (
        <ul className="space-y-2">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <span>
                {a.project.title} <span className="text-muted-foreground">({a.access})</span>
              </span>
              <Button variant="outline" size="sm" onClick={() => remove(a.id, a.project.id)}>
                {en ? "Remove" : "Hiq"}
              </Button>
            </li>
          ))}
          {assignments.length === 0 && (
            <p className="text-sm text-muted-foreground">{en ? "No projects assigned." : "Asnjë projekt i caktuar."}</p>
          )}
        </ul>
      )}

      <div className="border-t pt-4 space-y-2">
        <Label>{en ? "Add to project" : "Shto në projekt"}</Label>
        <Input
          placeholder={en ? "Project ID (cuid)" : "ID projekti (cuid)"}
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          value={access}
          onChange={(e) => setAccess(e.target.value as ProjectAccess)}
        >
          {PROJECT_ACCESS_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={addAssignment}>
          {en ? "Assign" : "Cakto"}
        </Button>
      </div>
    </div>
  );
}
