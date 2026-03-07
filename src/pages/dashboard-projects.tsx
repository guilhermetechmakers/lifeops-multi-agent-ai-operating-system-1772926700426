import { Link } from "react-router-dom";
import { FolderKanban, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/animated-page";

const projects = [
  { id: "1", name: "lifeops-app", repo: "github.com/org/lifeops-app", prs: 2, issues: 5 },
  { id: "2", name: "docs-site", repo: "github.com/org/docs", prs: 0, issues: 1 },
];

export default function DashboardProjects() {
  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Developer hub — roadmap, PRs, CI status, agent suggestions
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.id} to={`/dashboard/projects/${p.id}`}>
            <Card className="border-white/[0.03] bg-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <FolderKanban className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">{p.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{p.repo}</p>
                <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                  <span>{p.prs} PRs</span>
                  <span>{p.issues} issues</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="border-white/[0.03] bg-card border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GitBranch className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Connect a repository</p>
          <Button variant="outline" size="sm" className="mt-2">
            Add project
          </Button>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
