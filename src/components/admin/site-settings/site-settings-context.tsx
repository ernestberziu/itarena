"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type {
  MarketingServiceRecord,
  SiteSettingsBundle,
  SiteSettingsSectionKey,
  TestimonialRecord,
} from "@/lib/site-content/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-content/defaults";

export type SiteSectionId =
  | "services"
  | "hero"
  | "testimonials"
  | "social"
  | "contact"
  | "footer";

type SaveState = "idle" | "saving" | "saved" | "unsaved";

type SiteSettingsContextValue = {
  activeSection: SiteSectionId;
  setActiveSection: (s: SiteSectionId) => void;
  previewLocale: "sq" | "en";
  setPreviewLocale: (l: "sq" | "en") => void;
  settings: SiteSettingsBundle;
  savedSettings: SiteSettingsBundle;
  services: MarketingServiceRecord[];
  testimonials: TestimonialRecord[];
  setSettings: React.Dispatch<React.SetStateAction<SiteSettingsBundle>>;
  setServices: React.Dispatch<React.SetStateAction<MarketingServiceRecord[]>>;
  setTestimonials: React.Dispatch<React.SetStateAction<TestimonialRecord[]>>;
  updateSection: <K extends SiteSettingsSectionKey>(
    key: K,
    value: SiteSettingsBundle[K]
  ) => void;
  saveSection: (section: SiteSettingsSectionKey) => Promise<void>;
  saveState: SaveState;
  lastSavedAt: Date | null;
  discardSection: (section: SiteSettingsSectionKey) => void;
  reloadAll: () => Promise<void>;
  loading: boolean;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<SiteSectionId>("services");
  const [previewLocale, setPreviewLocale] = useState<"sq" | "en">("sq");
  const [settings, setSettings] = useState<SiteSettingsBundle>(DEFAULT_SITE_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<SiteSettingsBundle>(DEFAULT_SITE_SETTINGS);
  const [services, setServices] = useState<MarketingServiceRecord[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSection = useRef<SiteSettingsSectionKey | null>(null);

  const reloadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, servicesRes, testimonialsRes] = await Promise.all([
        fetch("/api/admin/site/settings"),
        fetch("/api/admin/site/services"),
        fetch("/api/admin/site/testimonials"),
      ]);
      const settingsJson = (await settingsRes.json()) as { settings?: SiteSettingsBundle };
      const servicesJson = (await servicesRes.json()) as { services?: MarketingServiceRecord[] };
      const testimonialsJson = (await testimonialsRes.json()) as {
        testimonials?: TestimonialRecord[];
      };
      if (settingsJson.settings) {
        setSettings(settingsJson.settings);
        setSavedSettings(settingsJson.settings);
      }
      if (servicesJson.services) setServices(servicesJson.services);
      if (testimonialsJson.testimonials) setTestimonials(testimonialsJson.testimonials);
      setSaveState("saved");
    } catch {
      toast.error("Failed to load site settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadAll();
  }, [reloadAll]);

  const updateSection = useCallback(
    <K extends SiteSettingsSectionKey>(key: K, value: SiteSettingsBundle[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setSaveState("unsaved");
      pendingSection.current = key;
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        void saveSectionRef.current?.(key);
      }, 2000);
    },
    []
  );

  const saveSectionRef = useRef<(section: SiteSettingsSectionKey) => Promise<void>>(async () => {});

  const saveSection = useCallback(
    async (section: SiteSettingsSectionKey) => {
      setSaveState("saving");
      try {
        const res = await fetch("/api/admin/site/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, data: settings[section] }),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error || "Save failed");
        }
        const json = (await res.json()) as { settings: SiteSettingsBundle };
        setSettings(json.settings);
        setSavedSettings(json.settings);
        setLastSavedAt(new Date());
        setSaveState("saved");
        pendingSection.current = null;
      } catch (e) {
        setSaveState("unsaved");
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    },
    [settings]
  );

  saveSectionRef.current = saveSection;

  const discardSection = useCallback(
    (section: SiteSettingsSectionKey) => {
      setSettings((prev) => ({ ...prev, [section]: savedSettings[section] }));
      setSaveState("saved");
    },
    [savedSettings]
  );

  const value = useMemo(
    () => ({
      activeSection,
      setActiveSection,
      previewLocale,
      setPreviewLocale,
      settings,
      savedSettings,
      services,
      testimonials,
      setSettings,
      setServices,
      setTestimonials,
      updateSection,
      saveSection,
      saveState,
      lastSavedAt,
      discardSection,
      reloadAll,
      loading,
    }),
    [
      activeSection,
      previewLocale,
      settings,
      savedSettings,
      services,
      testimonials,
      updateSection,
      saveSection,
      saveState,
      lastSavedAt,
      discardSection,
      reloadAll,
      loading,
    ]
  );

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  );
}
