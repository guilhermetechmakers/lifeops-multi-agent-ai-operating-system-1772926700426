import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedPage } from "@/components/animated-page";
import { EditorAttachmentSurface } from "@/components/artifacts";
import { FileText } from "lucide-react";

const DEMO_CONTENT_ID = "demo-content-1";

export default function DashboardContent() {
  const [attachedIds, setAttachedIds] = useState<string[]>([]);

  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Content</h1>
        <p className="text-sm text-muted-foreground">
          Calendar, drafts, publishing queue, SEO insights
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
          </CardContent>
        </Card>
        <Card className="border-white/[0.03] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle>Content pipeline</CardTitle>
          <p className="text-sm text-muted-foreground">Create and schedule with the content editor</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="draft" className="w-full">
            <TabsList className="bg-secondary border-white/[0.03]">
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            <TabsContent value="draft" className="mt-4">
              <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  LLM-assisted authoring — attach artifacts to your draft
                </p>
                <EditorAttachmentSurface
                  contentItemId={DEMO_CONTENT_ID}
                  stepLabel="draft"
                  attachedIds={attachedIds}
                  onAttach={(id) => setAttachedIds((prev) => (id && !prev.includes(id) ? [...prev, id] : prev))}
                  onDetach={(id) => setAttachedIds((prev) => prev.filter((x) => x !== id))}
                />
              </div>
            </TabsContent>
            <TabsContent value="research" className="mt-4">
              <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-4">
                <EditorAttachmentSurface
                  contentItemId={DEMO_CONTENT_ID}
                  stepLabel="research"
                  attachedIds={attachedIds}
                  onAttach={(id) => setAttachedIds((prev) => (id && !prev.includes(id) ? [...prev, id] : prev))}
                  onDetach={(id) => setAttachedIds((prev) => prev.filter((x) => x !== id))}
                />
              </div>
            </TabsContent>
            <TabsContent value="schedule" className="mt-4">
              <div className="rounded-lg border border-white/[0.03] bg-secondary/30 p-4">
                <EditorAttachmentSurface
                  contentItemId={DEMO_CONTENT_ID}
                  stepLabel="schedule"
                  attachedIds={attachedIds}
                  onAttach={(id) => setAttachedIds((prev) => (id && !prev.includes(id) ? [...prev, id] : prev))}
                  onDetach={(id) => setAttachedIds((prev) => prev.filter((x) => x !== id))}
                />
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-center pt-4">
            <Button className="bg-primary hover:bg-primary/90">
              <FileText className="mr-2 h-4 w-4" />
              New draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
