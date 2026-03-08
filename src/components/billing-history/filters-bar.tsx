/**
 * FiltersBar — date range, status, plan, search, reset for billing history.
 */

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import type { BillingHistoryFilters } from "@/types/billing-history";

export interface FiltersBarProps {
  filters: BillingHistoryFilters;
  onChange: (filters: BillingHistoryFilters) => void;
  className?: string;
}

export function FiltersBar({ filters, onChange, className }: FiltersBarProps) {
  const handleReset = () => {
    onChange({});
  };

  return (
    <div
      className={className}
      role="search"
      aria-label="Filter billing history"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search invoice number..."
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
            className="pl-9 h-9"
            aria-label="Search"
          />
        </div>
        <Input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
          className="w-[140px] h-9"
          aria-label="Date from"
        />
        <Input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
          className="w-[140px] h-9"
          aria-label="Date to"
        />
        <Select
          value={filters.status ?? "all"}
          onValueChange={(v) => onChange({ ...filters, status: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="due">Due</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1"
          onClick={handleReset}
          aria-label="Reset filters"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
