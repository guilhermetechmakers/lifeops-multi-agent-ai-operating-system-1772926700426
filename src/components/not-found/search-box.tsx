import { useState, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SearchBoxProps {
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
}

/**
 * Reusable search input for 404 page. On submit, navigates to dashboard with
 * optional query param. Guards against null/undefined input; value is controlled.
 */
export function SearchBox({
  className,
  placeholder = "Search LifeOps…",
  "aria-label": ariaLabel = "Search LifeOps",
}: SearchBoxProps) {
  const navigate = useNavigate();
  const [value, setValue] = useState<string>("");

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const query = (value ?? "").trim();
      if (query) {
        navigate(`/dashboard?q=${encodeURIComponent(query)}`);
      } else {
        navigate("/dashboard");
      }
    },
    [navigate, value]
  );

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-2 sm:flex-row sm:items-center", className)}
    >
      <label htmlFor="not-found-search" className="sr-only">
        {ariaLabel}
      </label>
      <Input
        id="not-found-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value ?? "")}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="flex-1 min-w-0 max-w-md bg-secondary border-white/[0.03] focus-visible:ring-ring"
        autoComplete="off"
      />
      <Button type="submit" variant="default" className="sm:self-stretch">
        <Search className="h-4 w-4" aria-hidden />
        Search
      </Button>
    </form>
  );
}
