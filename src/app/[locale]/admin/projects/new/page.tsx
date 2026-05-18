"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function NewProjectPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "sq";
  const lp = locale === "sq" ? "" : `/${locale}`;
  const en = locale === "en";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null }),
      });
      if (!res.ok) throw new Error("Failed");
      const project = await res.json();
      toast.success(en ? "Project created" : "Projekti u krijua");
      router.push(`${lp}/admin/projects/${project.id}`);
    } catch {
      toast.error(en ? "Error" : "Gabim");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <AdminPageHeader
        title={en ? "New project" : "Projekt i ri"}
        toolbar={
          <Button variant="outline" size="sm" asChild>
            <Link href={`${lp}/admin/projects`}>{en ? "← Back" : "← Kthehu"}</Link>
          </Button>
        }
      />
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label>{en ? "Title" : "Titulli"}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>{en ? "Description" : "Përshkrimi"}</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (en ? "Creating…" : "Duke krijuar…") : en ? "Create" : "Krijo"}
        </Button>
      </form>
    </div>
  );
}
