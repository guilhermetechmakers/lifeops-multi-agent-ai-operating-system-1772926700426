/**
 * Content Editor — end-to-end flow: idea → research → draft → edit → schedule → publish.
 */

import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Lightbulb, Search, Edit, Calendar, Send } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedPage } from "@/components/animated-page";
import { useContentItem } from "@/hooks/use-content-dashboard";

const STAGES = [
  { id: "idea", label: "Idea", icon: Lightbulb },
  { id: "research", label: "Research", icon: Search },
  { id: "draft", label: "Draft", icon: FileText },
  { id: "edit", label: "Edit", icon: Edit },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "publish", label: "Publish", icon: Send },
];

export default function ContentEditorPage() {
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("itemId");
  const template = searchParams.get("template");
  const topicParam = searchParams.get("topic");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeStage, setActiveStage] = useState("draft");

  const { data: item } = useContentItem(itemId);

  useEffect(() => {
    if (item) {
      setTitle(item.title ?? "");
    } else if (topicParam) {
      setTitle(topicParam);
    } else if (template === "blog") {
      setTitle("Untitled Blog Post");
    } else if (template === "newsletter") {
      setTitle("Untitled Newsletter");
    } else if (template === "social") {
      setTitle("Untitled Social Post");
    } else if (template === "idea") {
      setTitle(topicParam ?? "New Idea");
    } else {
      setTitle("Untitled");
    }
  }, [item, template, topicParam]);

  return (
    <AnimatedPage className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/content">
          <Button variant="ghost" size="icon" aria-label="Back to Content Dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-foreground truncate">
            Content Editor
          </h1>
          <p className="text-sm text-muted-foreground">
            idea → research → draft → edit → schedule → publish
          </p>
        </div>
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader className="pb-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="text-lg font-semibold border-0 bg-transparent focus-visible:ring-0 px-0"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {STAGES.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStage(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeStage === s.id
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeStage} onValueChange={setActiveStage}>
            <TabsList className="bg-secondary border-white/[0.03] mb-4">
              {STAGES.map((s) => (
                <TabsTrigger key={s.id} value={s.id}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="idea" className="mt-4">
              <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Capture your content idea. Add notes, keywords, and target audience.
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your idea..."
                  className="w-full min-h-[120px] rounded-md border border-white/[0.03] bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </TabsContent>
            <TabsContent value="research" className="mt-4">
              <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Research phase — gather sources, competitor content, and SEO data.
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Research notes..."
                  className="w-full min-h-[120px] rounded-md border border-white/[0.03] bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </TabsContent>
            <TabsContent value="draft" className="mt-4">
              <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  LLM-assisted authoring — write your draft. Attach artifacts as needed.
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your draft..."
                  className="w-full min-h-[200px] rounded-md border border-white/[0.03] bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </TabsContent>
            <TabsContent value="edit" className="mt-4">
              <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Edit and refine. Versioning is tracked automatically.
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Edit your content..."
                  className="w-full min-h-[200px] rounded-md border border-white/[0.03] bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </TabsContent>
            <TabsContent value="schedule" className="mt-4">
              <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule publication. Select date, time, and target channels.
                </p>
                <div className="space-y-2">
                  <Input type="datetime-local" className="max-w-xs" />
                  <p className="text-xs text-muted-foreground">
                    Channels: blog, newsletter (configure in settings)
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="publish" className="mt-4">
              <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Review and publish. All actions are auditable.
                </p>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Publish Now
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
