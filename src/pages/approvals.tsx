import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/animated-page";
import { Check, X } from "lucide-react";

const items = [
  { id: "1", title: "Monthly close — post journal entries", agent: "Finance Agent", age: "5 min ago" },
  { id: "2", title: "Content publish — publish draft to CMS", agent: "Content Agent", age: "1 hr ago" },
];

export default function Approvals() {
  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Approvals queue</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve actions that require human-in-the-loop
        </p>
      </div>

      <Card className="border-white/[0.03] bg-card">
        <CardHeader>
          <CardTitle>Pending approvals</CardTitle>
          <p className="text-sm text-muted-foreground">
            {items.length} item(s) waiting for review
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-lg border border-white/[0.03] bg-secondary/50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.agent} · {item.age}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-destructive border-destructive/50">
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No pending approvals. When agents suggest actions that require approval, they’ll appear here.
            </p>
          )}
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
