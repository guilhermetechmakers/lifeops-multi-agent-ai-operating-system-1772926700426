/**
 * CookieCategoryCard — Explanatory card with toggle and status badge.
 * Necessary category is non-toggleable; Analytics/Marketing are toggleable.
 * LifeOps design: dark UI, card gradient, 8px grid, accessible toggles.
 */

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConsentCategory } from "@/types/cookie-policy";

interface CookieCategoryCardBaseProps {
  id: string;
  title: string;
  description: string;
  dataUsageNotes?: string;
  enabled: boolean;
  disabled?: boolean;
  required?: boolean;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

interface CookieCategoryCardCategoryProps {
  category: ConsentCategory;
  onToggle?: (id: string, enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

type CookieCategoryCardProps = CookieCategoryCardBaseProps | CookieCategoryCardCategoryProps;

function isCategoryProps(
  p: CookieCategoryCardProps
): p is CookieCategoryCardCategoryProps {
  return "category" in p;
}

const CATEGORY_TITLES: Record<string, string> = {
  necessary: "Necessary",
  analytics: "Analytics",
  marketing: "Marketing",
};

export function CookieCategoryCard(props: CookieCategoryCardProps) {
  let id: string;
  let title: string;
  let description: string;
  let dataUsageNotes: string | undefined;
  let enabled: boolean;
  let disabled: boolean;
  let required: boolean;
  let onToggle: ((enabled: boolean) => void) | undefined;
  let className: string | undefined;

  if (isCategoryProps(props)) {
    const { category, onToggle: onToggleCat, disabled: dis = false, className: cnProp } = props;
    className = cnProp;
    id = category.id;
    title = CATEGORY_TITLES[category.id] ?? category.id;
    description = category.description ?? "";
    dataUsageNotes = category.dataUsageNotes;
    enabled = category.enabled;
    disabled = dis;
    required = category.required === true;
    onToggle =
      onToggleCat && !required
        ? (e: boolean) => onToggleCat(category.id, e)
        : undefined;
  } else {
    ({
      id,
      title,
      description,
      dataUsageNotes,
      enabled,
      disabled = false,
      required = false,
      onToggle,
      className,
    } = props);
  }

  const isToggleable = !required && !disabled && onToggle != null;

  return (
    <article
      className={cn(
        "rounded-xl border border-white/[0.03] bg-gradient-to-b from-[#0B0B0C] to-[#151718] p-5 sm:p-6",
        "transition-all duration-200 hover:shadow-card-hover",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background focus-within:rounded-xl",
        className
      )}
      style={{
        boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.03), 0 2px 8px rgba(0, 0, 0, 0.2)",
      }}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 id={`${id}-title`} className="text-base font-semibold text-foreground">
              {title}
            </h3>
            <Badge
              variant={enabled ? "default" : "secondary"}
              className={cn(
                "text-xs",
                enabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              {enabled ? "On" : "Off"}
            </Badge>
          </div>
          <p id={`${id}-desc`} className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          {dataUsageNotes && (
            <p className="mt-2 text-xs text-muted-foreground/80">
              Data usage: {dataUsageNotes}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Label
            htmlFor={`cookie-toggle-${id}`}
            className={cn(
              "text-sm font-medium cursor-pointer",
              !isToggleable && "cursor-default opacity-70"
            )}
          >
            {required ? "Always on" : "Toggle"}
          </Label>
          <Switch
            id={`cookie-toggle-${id}`}
            checked={enabled}
            disabled={!isToggleable}
            onCheckedChange={isToggleable ? onToggle : undefined}
            aria-label={`${title}: ${enabled ? "enabled" : "disabled"}`}
            aria-checked={enabled}
            role="switch"
          />
        </div>
      </div>
    </article>
  );
}
