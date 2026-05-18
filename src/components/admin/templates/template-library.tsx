"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplatesSubnav } from "./templates-subnav";
import { BilingualMarkdownFields } from "./bilingual-markdown-fields";
import { TEMPLATE_VARIABLES } from "@/lib/templates/variables";
import { defaultClauseForLibrary } from "@/lib/templates/localized";

type Template = {
  id: string;
  name: string;
  type: string;
  bodyMarkdownSq: string;
  bodyMarkdownEn: string;
  defaultLanguage: string;
  isDefault: boolean;
};

export function TemplateLibrary({ lp }: { lp: string }) {
  const t = useTranslations("admin.templatesPage");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [bodySq, setBodySq] = useState(() => defaultClauseForLibrary("SERVICE_CONTRACT", "sq"));
  const [bodyEn, setBodyEn] = useState(() => defaultClauseForLibrary("SERVICE_CONTRACT", "en"));
  const [editorLang, setEditorLang] = useState<"sq" | "en">("sq");
  const [type, setType] = useState<"SERVICE_CONTRACT" | "EMPLOYMENT">("SERVICE_CONTRACT");

  function load() {
    void fetch("/api/admin/templates/library").then((r) => r.json()).then(setTemplates);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setBodySq(defaultClauseForLibrary(type, "sq"));
    setBodyEn(defaultClauseForLibrary(type, "en"));
  }, [type]);

  async function save() {
    await fetch("/api/admin/templates/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        bodyMarkdownSq: bodySq,
        bodyMarkdownEn: bodyEn,
        defaultLanguage: editorLang,
      }),
    });
    setName("");
    setBodySq(defaultClauseForLibrary(type, "sq"));
    setBodyEn(defaultClauseForLibrary(type, "en"));
    load();
  }

  function insertVar(v: string, lang: "sq" | "en") {
    const token = `\n{{${v}}}`;
    if (lang === "sq") setBodySq((b) => `${b}${token}`);
    else setBodyEn((b) => `${b}${token}`);
  }

  return (
    <div>
      <TemplatesSubnav lp={lp} />
      <h1 className="mb-2 text-2xl font-bold">{t("saved")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("savedTemplatesHint")}</p>
      <div className="mb-8 grid gap-6 rounded-2xl border border-border/50 p-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label>{t("templateName")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="h-9 rounded-lg border bg-background px-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              <option value="SERVICE_CONTRACT">{t("serviceContract")}</option>
              <option value="EMPLOYMENT">{t("employment")}</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("variables")}</p>
            <div className="flex flex-wrap gap-1">
              {TEMPLATE_VARIABLES.map((v) => (
                <Button
                  key={v}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => insertVar(v, editorLang)}
                >
                  {`{{${v}}}`}
                </Button>
              ))}
            </div>
          </div>
          <BilingualMarkdownFields
            activeLanguage={editorLang}
            onLanguageChange={setEditorLang}
            bodySq={bodySq}
            bodyEn={bodyEn}
            onBodySqChange={setBodySq}
            onBodyEnChange={setBodyEn}
            labels={{
              tabSq: t("langSq"),
              tabEn: t("langEn"),
              editorSq: t("contractBodySq"),
              editorEn: t("contractBodyEn"),
              editorFullscreen: t("editorFullscreen"),
            }}
          />
          <Button type="button" onClick={() => void save()} disabled={!name.trim()}>
            {t("saveTemplate")}
          </Button>
        </div>
        <ul className="space-y-2">
          {templates.map((tpl) => (
            <li key={tpl.id} className="rounded-lg border border-border/40 p-3 text-sm">
              <p className="font-medium">{tpl.name}</p>
              <p className="text-muted-foreground">
                {tpl.type === "SERVICE_CONTRACT" ? t("serviceContract") : t("employment")}
                {" · "}
                {t("langSq")} / {t("langEn")}
                {tpl.isDefault ? ` · ${t("defaultTemplate")}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
