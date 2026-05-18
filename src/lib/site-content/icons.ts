import type { LucideIcon } from "lucide-react";
import {
  Headphones,
  Cloud,
  Camera,
  Globe,
  Wifi,
  Code2,
  Phone,
  Printer,
  Monitor,
  Users,
  Trophy,
  Clock,
  Zap,
  TrendingUp,
  Network,
  Star,
  Shield,
  Mail,
  MapPin,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Headphones,
  Cloud,
  Camera,
  Globe,
  Wifi,
  Code2,
  Phone,
  Printer,
  Monitor,
  Users,
  Trophy,
  Clock,
  Zap,
  TrendingUp,
  Network,
  Star,
  Shield,
  Mail,
  MapPin,
};

export function getLucideIcon(key: string): LucideIcon {
  return ICON_MAP[key] ?? Monitor;
}

export const LUCIDE_ICON_OPTIONS = Object.keys(ICON_MAP).sort();
