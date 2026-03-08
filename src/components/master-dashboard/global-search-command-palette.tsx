import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckSquare,
  Plus,
  LayoutDashboard,
  FileText,
  Wallet,
  Heart,
  FolderKanban,
  Settings,
  User,
  FileCode,
  Paperclip,
  Trash2,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useCommandPalette } from "@/contexts/command-palette-context";
import { useMasterSearch } from "@/hooks/use-master-dashboard";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { GlobalSearchResult } from "@/types/master-dashboard";

interface GlobalSearchCommandPaletteProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

function GlobalSearchCommandPaletteContent({
  searchValue,
  onSearchChange,
}: GlobalSearchCommandPaletteProps) {
  const navigate = useNavigate();
  const { open, setOpen } = useCommandPalette();
  const debouncedQuery = useDebouncedValue(searchValue, 300);
  const { data: searchResults = [], isLoading } = useMasterSearch(debouncedQuery);
  const results = (Array.isArray(searchResults) ? searchResults : []) as GlobalSearchResult[];

  const runCommand = useCallback(
    (path: string) => {
      setOpen(false);
      onSearchChange("");
      navigate(path);
    },
    [navigate, setOpen, onSearchChange]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      overlayClassName="bg-black/80"
      contentClassName="border border-white/[0.03] bg-card p-0 max-w-2xl"
    >
      <CommandInput
        placeholder="Search cronjobs, runs, agents, templates, projects..."
        value={searchValue}
        onValueChange={onSearchChange}
        aria-label="Global search"
      />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          {searchValue.length >= 2 && isLoading
            ? "Searching..."
            : "No results found."}
        </CommandEmpty>

        {results.length > 0 && (
          <CommandGroup heading="Search results">
            {results.map((r) => (
              <CommandItem
                key={`${r.module}-${r.id}`}
                value={`${r.module}-${r.id}-${r.title}`}
                onSelect={() => runCommand(r.url)}
              >
                <span className="font-medium">{r.title}</span>
                {r.subtitle && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {r.subtitle}
                  </span>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {r.module}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(results.length > 0 || searchValue.length < 2) && (
          <>
            {results.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Quick actions">
              <CommandItem
                value="new-cronjob"
                onSelect={() => runCommand("/dashboard/cronjobs/new")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create cronjob
              </CommandItem>
              <CommandItem
                value="run-workflow"
                onSelect={() => runCommand("/dashboard/cronjobs")}
              >
                <FileCode className="mr-2 h-4 w-4" />
                Run workflow
              </CommandItem>
              <CommandItem
                value="approvals"
                onSelect={() => runCommand("/dashboard/approvals")}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                View approvals
              </CommandItem>
              <CommandItem
                value="templates"
                onSelect={() => runCommand("/dashboard")}
              >
                <FileCode className="mr-2 h-4 w-4" />
                Open templates
              </CommandItem>
              <CommandItem
                value="cronjobs"
                onSelect={() => runCommand("/dashboard/cronjobs")}
              >
                <Clock className="mr-2 h-4 w-4" />
                View all cronjobs
              </CommandItem>
              <CommandItem
                value="clear-cache"
                onSelect={() => {
                  setOpen(false);
                  onSearchChange("");
                  window.location.reload();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear cache
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigation">
              <CommandItem value="master" onSelect={() => runCommand("/dashboard")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Master Dashboard
              </CommandItem>
              <CommandItem
                value="projects"
                onSelect={() => runCommand("/dashboard/projects")}
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                Projects
              </CommandItem>
              <CommandItem
                value="content"
                onSelect={() => runCommand("/dashboard/content")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Content
              </CommandItem>
              <CommandItem
                value="finance"
                onSelect={() => runCommand("/dashboard/finance")}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Finance
              </CommandItem>
              <CommandItem
                value="health"
                onSelect={() => runCommand("/dashboard/health")}
              >
                <Heart className="mr-2 h-4 w-4" />
                Health
              </CommandItem>
              <CommandItem
                value="artifacts"
                onSelect={() => runCommand("/dashboard/artifacts")}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                Artifacts
              </CommandItem>
              <CommandItem
                value="profile"
                onSelect={() => runCommand("/dashboard/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </CommandItem>
              <CommandItem
                value="settings"
                onSelect={() => runCommand("/dashboard/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function GlobalSearchCommandPalette() {
  const [searchValue, setSearchValue] = useState("");
  const { open, setOpen } = useCommandPalette();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  useEffect(() => {
    if (!open) setSearchValue("");
  }, [open]);

  return (
    <GlobalSearchCommandPaletteContent
      searchValue={searchValue}
      onSearchChange={setSearchValue}
    />
  );
}
