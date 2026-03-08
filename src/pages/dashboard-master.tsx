import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  CheckSquare,
  AlertCircle,
  Plus,
  LayoutDashboard,
  FileText,
  Wallet,
  Heart,
  FolderKanban,
  Settings,
  User,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/animated-page";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { NotificationCenter } from "@/components/notifications";

const runData = [
  { name: "Mon", runs: 12, success: 10 },
  { name: "Tue", runs: 18, success: 17 },
  { name: "Wed", runs: 15, success: 14 },
  { name: "Thu", runs: 22, success: 20 },
  { name: "Fri", runs: 14, success: 13 },
];

const cronjobsSnapshot = [
  { id: "1", name: "PR triage", nextRun: "~15 min", lastStatus: "success", enabled: true },
  { id: "2", name: "Daily digest", nextRun: "~2 hr", lastStatus: "success", enabled: true },
  { id: "3", name: "Monthly close", nextRun: "Pending", lastStatus: "approval", enabled: true },
];

export default function DashboardMaster() {
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const pendingApprovals = 2;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (path: string) => {
    setCommandOpen(false);
    navigate(path);
  };

  return (
    <AnimatedPage className="space-y-6">
      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        overlayClassName="bg-black/80"
        contentClassName="border border-white/[0.03] bg-card p-0"
      >
        <CommandInput placeholder="Search cronjobs, runs, agents, notifications..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick actions">
            <CommandItem value="new-cronjob" onSelect={() => runCommand("/dashboard/cronjobs/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create cronjob
            </CommandItem>
            <CommandItem value="approvals" onSelect={() => runCommand("/dashboard/approvals")}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Approvals queue
            </CommandItem>
            <CommandItem value="cronjobs" onSelect={() => runCommand("/dashboard/cronjobs")}>
              <Clock className="mr-2 h-4 w-4" />
              View all cronjobs
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem value="master" onSelect={() => runCommand("/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Master Dashboard
            </CommandItem>
            <CommandItem value="projects" onSelect={() => runCommand("/dashboard/projects")}>
              <FolderKanban className="mr-2 h-4 w-4" />
              Projects
            </CommandItem>
            <CommandItem value="content" onSelect={() => runCommand("/dashboard/content")}>
              <FileText className="mr-2 h-4 w-4" />
              Content
            </CommandItem>
            <CommandItem value="finance" onSelect={() => runCommand("/dashboard/finance")}>
              <Wallet className="mr-2 h-4 w-4" />
              Finance
            </CommandItem>
            <CommandItem value="health" onSelect={() => runCommand("/dashboard/health")}>
              <Heart className="mr-2 h-4 w-4" />
              Health
            </CommandItem>
            <CommandItem value="profile" onSelect={() => runCommand("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </CommandItem>
            <CommandItem value="settings" onSelect={() => runCommand("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Master Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandOpen(true)}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Search
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/10 bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Link to="/dashboard/cronjobs/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New cronjob
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active cronjobs
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">8</div>
                <p className="text-xs text-muted-foreground">3 running now</p>
              </CardContent>
            </Card>
            <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending approvals
                </CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{pendingApprovals}</div>
                <Link
                  to="/dashboard/approvals"
                  className="text-xs text-primary hover:underline"
                >
                  Review queue
                </Link>
              </CardContent>
            </Card>
            <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Agent health
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="success">All healthy</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/[0.03] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Runs (7d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">81</div>
                <p className="text-xs text-muted-foreground">94% success rate</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/[0.03] bg-card">
            <CardHeader>
              <CardTitle>Run activity</CardTitle>
              <p className="text-sm text-muted-foreground">Last 5 days</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={runData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" />
                  <XAxis dataKey="name" className="text-xs text-muted-foreground" />
                  <YAxis className="text-xs text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(21 23 24)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="runs"
                    stroke="rgb(255 59 48)"
                    strokeWidth={2}
                    name="Runs"
                  />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke="#00C2A8"
                    strokeWidth={2}
                    name="Success"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-white/[0.03] bg-card">
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Link to="/dashboard/cronjobs/new">
                  <Button variant="outline" size="sm" className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    Create cronjob
                  </Button>
                </Link>
                <Link to="/dashboard/approvals">
                  <Button variant="outline" size="sm" className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    Approvals queue
                  </Button>
                </Link>
                <Link to="/dashboard/cronjobs">
                  <Button variant="outline" size="sm" className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    View all cronjobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-white/[0.03] bg-card">
              <CardHeader>
                <CardTitle>Active cronjobs snapshot</CardTitle>
                <p className="text-sm text-muted-foreground">Next run & status</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {cronjobsSnapshot.map((cj) => (
                    <li
                      key={cj.id}
                      className="flex items-center justify-between rounded-md border border-white/[0.03] bg-secondary/50 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-foreground">{cj.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Next: {cj.nextRun} · {cj.lastStatus}
                        </p>
                      </div>
                      <Badge variant={cj.enabled ? "success" : "secondary"}>
                        {cj.enabled ? "On" : "Off"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <NotificationCenter maxHeight="500px" />
          <Card className="border-white/[0.03] bg-card">
            <CardHeader>
              <CardTitle>Cross-module alerts</CardTitle>
              <p className="text-sm text-muted-foreground">Recent anomalies & outcomes</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal" />
                  PR triage — success (2 min ago)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal" />
                  Daily digest — success (1 hr ago)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber" />
                  Monthly close — pending approval
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  );
}
