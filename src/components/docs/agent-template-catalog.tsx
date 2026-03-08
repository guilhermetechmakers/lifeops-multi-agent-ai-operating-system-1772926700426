import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDocsTemplates } from "@/api/docs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { AgentTemplate } from "@/types/docs";

const categories = ["All", "Engineering", "Content", "Health", "Finance"];

export function AgentTemplateCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [language, setLanguage] = useState("All");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["docs", "templates"],
    queryFn: () => fetchDocsTemplates(),
  });

  const templates: AgentTemplate[] = Array.isArray(data?.data) ? data.data : [];
  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchSearch =
        !search.trim() ||
        (t?.name ?? "").toLowerCase().includes(search.trim().toLowerCase()) ||
        (t?.description ?? "").toLowerCase().includes(search.trim().toLowerCase());
      const matchCategory = category === "All" || (t?.category ?? "") === category;
      const matchLang = language === "All" || (t?.language ?? "") === language;
      return matchSearch && matchCategory && matchLang;
    });
  }, [templates, search, category, language]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Failed to load agent templates.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Agent template catalog</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pre-built agents for PR triage, content drafting, transaction categorization, and habit coaching.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50"
            aria-label="Search templates"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[160px] bg-secondary/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[140px] bg-secondary/50">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="TypeScript">TypeScript</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Card
            key={t?.id ?? ""}
            className="flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-medium text-foreground">{t?.name ?? ""}</h2>
                <Badge variant="secondary" className="text-xs shrink-0">
                  v{t?.version ?? "1.0.0"}
                </Badge>
              </div>
              <Badge variant="outline" className="w-fit mt-1 text-xs">
                {t?.category ?? ""}
              </Badge>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3">{t?.description ?? ""}</p>
              {t?.preview && (
                <p className="mt-2 text-xs text-muted-foreground/80 italic">{t.preview}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No templates match your filters.</p>
      )}
    </div>
  );
}
