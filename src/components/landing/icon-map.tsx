import {
  Bot,
  Clock,
  ShieldCheck,
  FolderKanban,
  FileText,
  CreditCard,
  Heart,
  Github,
  BarChart3,
  Zap,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "folder-kanban": FolderKanban,
  "file-text": FileText,
  "credit-card": CreditCard,
  heart: Heart,
  clock: Clock,
  bot: Bot,
  "shield-check": ShieldCheck,
  github: Github,
  stripe: CreditCard,
  plaid: BarChart3,
  google: Zap,
  quickbooks: BarChart3,
  "health-apis": Heart,
  zap: Zap,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Zap;
}
