/**
 * Filter bar for the templates catalog.
 */

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TemplateDomain, TemplateStatus } from "@/types/templates-personas";

const DOMAINS: { value: TemplateDomain | ""; label: string }[] = [
  { value: "", label: "All domains" },
  { value: "developer", label: "Developer" },
  { value: "content", label: "Content" },
  { value: "finance", label: "Finance" },
  { value: "health", label: "Health" },
];

const STATUSES: { value: TemplateStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "deprecated", label: "Deprecated" },
];

export interface TemplatesFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  domain: TemplateDomain | "";
  onDomainChange: (v: TemplateDomain | "") => void;
  status: TemplateStatus | "";
  onStatusChange: (v: TemplateStatus | "") => void;
}

export function TemplatesFilterBar({
  search,
  onSearchChange,
  domain,
  onDomainChange,
  status,
  onStatusChange,
}: TemplatesFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-secondary/50"
          aria-label="Search templates"
        />
      </div>
      <Select
        value={domain ? domain : "__all__"}
        onValueChange={(v) => onDomainChange((v === "__all__" ? "" : v) as TemplateDomain | "")}
      >
        <SelectTrigger className="w-[160px] bg-secondary/50">
          <SelectValue placeholder="Domain" />
        </SelectTrigger>
        <SelectContent>
          {DOMAINS.map((d) => (
            <SelectItem key={d.value || "__all__"} value={d.value || "__all__"}>
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={status ? status : "__all__"}
        onValueChange={(v) => onStatusChange((v === "__all__" ? "" : v) as TemplateStatus | "")}
      >
        <SelectTrigger className="w-[140px] bg-secondary/50">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s.value || "__all__"} value={s.value || "__all__"}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
