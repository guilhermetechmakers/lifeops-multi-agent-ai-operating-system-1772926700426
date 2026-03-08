/**
 * Content Editor — end-to-end flow: idea → research → draft → edit → schedule → publish.
 * Integrates EditorWorkspace, LLMAssistantPanel, ResearchPanel, AttachmentsPanel,
 * PublishControlsPanel, DiffViewer, HistoryPanel, LiveCollaborationPanel.
 */

import { useSearchParams, Link } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedPage } from "@/components/animated-page";
import {
  EditorWorkspace,
  AutosaveEngine,
  VersionBadgeStrip,
  LLMAssistantPanel,
  IdeaCaptureCard,
  ResearchPanel,
  AttachmentsPanel,
  PublishControlsPanel,
  DiffViewer,
  HistoryPanel,
  LiveCollaborationPanel,
} from "@/components/content-editor";
import {
  useDraft,
  useCreateDraft,
  useUpdateDraft,
  useVersions,
  useCreateVersion,
  useArtifacts,
  useUploadArtifact,
  useDeleteArtifact,
  useCitations,
  useAddCitation,
  useStartPipeline,
} from "@/hooks/use-content-editor";
import { toast } from "sonner";
import type { EditorMode } from "@/components/content-editor";
import type { Version } from "@/types/content-editor";

export default function ContentEditorPage() {
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("itemId");
  const template = searchParams.get("template");
  const topicParam = searchParams.get("topic");

  const [draftId, setDraftId] = useState<string | null>(itemId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editorMode, setEditorMode] = useState<EditorMode>("markdown");
  const [diffMode, setDiffMode] = useState<"side-by-side" | "inline">("side-by-side");
  const [selectedVersionForDiff, setSelectedVersionForDiff] = useState<Version | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState("assistant");

  const createDraft = useCreateDraft();
  const { data: draft, isLoading: draftLoading } = useDraft(draftId);
  const updateDraft = useUpdateDraft(draftId);
  const { items: versions } = useVersions(draftId);
  const createVersion = useCreateVersion(draftId);
  const { items: artifacts } = useArtifacts(draftId);
  const uploadArtifact = useUploadArtifact(draftId);
  const deleteArtifact = useDeleteArtifact(draftId);
  const { items: citations } = useCitations(draftId);
  const addCitation = useAddCitation(draftId);
  const startPipeline = useStartPipeline();

  useEffect(() => {
    if (draft) {
      setDraftId(draft.id);
      setTitle(draft.title ?? "");
      setContent(draft.content ?? "");
    } else if (itemId) {
      setDraftId(itemId);
    }
  }, [draft, itemId]);

  useEffect(() => {
    if (draft) {
      setTitle(draft.title ?? "");
      setContent(draft.content ?? "");
    }
  }, [draft?.title, draft?.content]);

  useEffect(() => {
    if (
      !draftId &&
      !draftLoading &&
      (template || topicParam) &&
      !createDraft.isPending
    ) {
      const initialTitle =
        topicParam ??
        (template === "blog"
          ? "Untitled Blog Post"
          : template === "newsletter"
            ? "Untitled Newsletter"
            : template === "social"
              ? "Untitled Social Post"
              : template === "idea"
                ? "New Idea"
                : "Untitled");
      createDraft.mutate(
        { title: initialTitle, content: "", format: "markdown" },
        {
          onSuccess: (d) => {
            setDraftId(d.id);
            setTitle(d.title);
            setContent(d.content ?? "");
            window.history.replaceState(
              {},
              "",
              `/dashboard/content/editor?itemId=${d.id}`
            );
          },
        }
      );
    }
  }, [draftId, draftLoading, template, topicParam, createDraft.isPending]);

  const handleAutosave = useCallback(
    async (newContent: string) => {
      if (!draftId) return;
      try {
        await updateDraft.mutateAsync({ content: newContent });
      } catch {
        // Toast handled by hook
      }
    },
    [draftId, updateDraft]
  );

  const handleManualSave = useCallback(() => {
    if (!draftId) return;
    updateDraft.mutate(
      { title, content },
      {
        onSuccess: () => {
          createVersion.mutate({
            content,
            changeSummary: "Manual save",
          });
        },
      }
    );
  }, [draftId, title, content, updateDraft, createVersion]);

  const handleUpload = useCallback(
    (formData: FormData) => {
      uploadArtifact.mutate({ formData });
    },
    [uploadArtifact]
  );

  const handlePublish = useCallback(
    (payload: {
      channel: string;
      schedule?: string;
      seoTitle?: string;
      seoDescription?: string;
      tags?: string[];
    }) => {
      if (!draftId) {
        toast.error("Save draft first");
        return;
      }
      updateDraft.mutate(
        {
          title,
          content,
          seoMetadata: {
            title: payload.seoTitle,
            description: payload.seoDescription,
            keywords: payload.tags,
          },
        },
        {
          onSuccess: () => {
            startPipeline.mutate(
              { draftId, plan: "publish", scope: { channel: payload.channel } },
              {
                onSuccess: () => toast.success("Publish scheduled"),
                onError: () => toast.error("Failed to publish"),
              }
            );
          },
        }
      );
    },
    [draftId, title, content, updateDraft, startPipeline]
  );

  const handleRevert = useCallback(
    (version: Version) => {
      setContent(version.content);
      updateDraft.mutate({ content: version.content });
      toast.success("Reverted to previous version");
    },
    [updateDraft]
  );

  const versionsList = Array.isArray(versions) ? versions : (versions ?? []);
  const sortedVersions = [...versionsList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const prevVersion =
    selectedVersionForDiff ?? sortedVersions[1] ?? null;

  return (
    <AnimatedPage className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/content">
          <Button variant="ghost" size="icon" aria-label="Back to Content Dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="text-xl font-semibold border-0 bg-transparent focus-visible:ring-0 px-0 h-auto"
          />
          <div className="flex items-center gap-4 mt-1">
            <VersionBadgeStrip
              versionNumber={versionsList.length || 1}
              lastModified={draft?.updatedAt}
              authorName={draft?.authorName}
            />
            <AutosaveEngine
              content={content}
              onSave={handleAutosave}
              intervalMs={30000}
              debounceMs={1500}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleManualSave}
              disabled={updateDraft.isPending || !draftId}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <IdeaCaptureCard
            onDraftGenerated={(draft) => {
              setContent(draft);
              if (draftId) updateDraft.mutate({ content: draft });
            }}
          />
          <EditorWorkspace
            value={content}
            onChange={setContent}
            mode={editorMode}
            onModeChange={setEditorMode}
            placeholder="Write your content..."
          />

          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab}>
            <TabsList className="bg-secondary border-white/[0.03]">
              <TabsTrigger value="assistant">LLM Assistant</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="diff">Diff</TabsTrigger>
            </TabsList>
            <TabsContent value="assistant" className="mt-4">
              <LLMAssistantPanel
                content={content}
                draftId={draftId}
                onApplySuggestion={(s) => setContent(s)}
              />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <HistoryPanel
                versions={versionsList}
                currentVersionId={draft?.currentVersionId}
                onRevert={handleRevert}
                onSelectVersion={setSelectedVersionForDiff}
              />
            </TabsContent>
            <TabsContent value="diff" className="mt-4">
              <DiffViewer
                oldContent={prevVersion?.content ?? ""}
                newContent={content}
                mode={diffMode}
                onModeChange={setDiffMode}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <LiveCollaborationPanel />
          <ResearchPanel
            citations={citations}
            onAddCitation={(p) => addCitation.mutate(p)}
          />
          <AttachmentsPanel
            artifacts={artifacts}
            onUpload={handleUpload}
            onDelete={(id) => deleteArtifact.mutate(id)}
            isUploading={uploadArtifact.isPending}
          />
          <PublishControlsPanel
            content={content}
            onPublish={handlePublish}
            onTestRun={() => toast.info("Test run would execute pipeline")}
            isPublishing={startPipeline.isPending}
          />
        </div>
      </div>
    </AnimatedPage>
  );
}
