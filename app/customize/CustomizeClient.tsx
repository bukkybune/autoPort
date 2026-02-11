"use client";

import type { GitHubRepo } from "../types/github";
import type { CustomizedProject } from "../types/customize";
import {
  CUSTOMIZE_STORAGE_KEY,
  SELECTED_REPOS_KEY,
  CUSTOMIZED_PROJECTS_KEY,
  DASHBOARD_SELECTION_KEY,
} from "../types/customize";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  GripVertical,
  Pencil,
  Trash2,
  Check,
  ExternalLink,
  X,
  Lightbulb,
} from "lucide-react";

const SUGGESTED_TAGS: Record<string, string[]> = {
  JavaScript: ["JavaScript", "Node.js", "React", "TypeScript"],
  TypeScript: ["TypeScript", "Node.js", "React"],
  Python: ["Python", "Django", "FastAPI", "Flask"],
  "C++": ["C++", "CMake"],
  Go: ["Go"],
  Rust: ["Rust"],
  Java: ["Java", "Spring"],
  Ruby: ["Ruby", "Rails"],
  PHP: ["PHP", "Laravel"],
  Swift: ["Swift", "iOS"],
  Kotlin: ["Kotlin", "Android"],
  Vue: ["Vue.js", "JavaScript"],
  Svelte: ["Svelte", "JavaScript"],
};

function repoToCustomized(repo: GitHubRepo, order: number): CustomizedProject {
  return {
    id: String(repo.id),
    originalName: repo.name,
    customTitle: repo.name,
    originalDescription: repo.description ?? null,
    customDescription: repo.description?.slice(0, 500) ?? "",
    tags: repo.language ? [repo.language] : [],
    imageUrl: undefined,
    demoUrl: undefined,
    githubUrl: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    showGithubLink: true,
    order,
  };
}

function SortableCard({
  project,
  onEdit,
  onDelete,
}: {
  project: CustomizedProject;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border bg-slate-900/60 p-4 sm:p-5 transition-all ${
        isDragging
          ? "border-blue-500/60 bg-slate-800/80 shadow-xl shadow-blue-500/10 opacity-95 z-50"
          : "border-slate-800 hover:border-slate-600"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-1 cursor-grab active:cursor-grabbing touch-manipulation rounded p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-50 truncate">
            {project.customTitle || project.originalName}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-400 min-h-[2.5rem]">
            {project.customDescription || project.originalDescription || "No description"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
              >
                {tag}
              </span>
            ))}
            {project.language && !project.tags.includes(project.language) && (
              <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                {project.language}
              </span>
            )}
            <span className="text-xs text-slate-500">
              ★ {project.stars}
            </span>
          </div>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            View on GitHub
          </a>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(project.id)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Edit project"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onDelete(project.id)}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            aria-label="Remove from selection"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({
  project,
  onClose,
  onSave,
}: {
  project: CustomizedProject;
  onClose: () => void;
  onSave: (updated: CustomizedProject) => void;
}) {
  const [title, setTitle] = useState(project.customTitle);
  const [description, setDescription] = useState(project.customDescription);
  const [tags, setTags] = useState<string[]>(project.tags);
  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState(project.imageUrl ?? "");
  const [demoUrl, setDemoUrl] = useState(project.demoUrl ?? "");
  const [showGithubLink, setShowGithubLink] = useState(project.showGithubLink);

  const suggestedTags = useMemo(
    () => (project.language ? SUGGESTED_TAGS[project.language] ?? [project.language] : []),
    [project.language]
  );

  const handleAddTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...project,
      customTitle: title.slice(0, 100).trim() || project.originalName,
      customDescription: description.slice(0, 500),
      tags,
      imageUrl: imageUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      showGithubLink,
    });
    onClose();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.metaKey && e.key === "s") {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:p-6">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:max-w-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-50">Edit Project Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-slate-200 mb-1">
              Project Title
            </label>
            <input
              id="edit-title"
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={project.originalName}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-slate-500">This will be the headline in your portfolio.</p>
          </div>
          <div>
            <label htmlFor="edit-desc" className="block text-sm font-medium text-slate-200 mb-1">
              Description
            </label>
            <textarea
              id="edit-desc"
              rows={4}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={project.originalDescription ?? "Describe what this project does and your role"}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
            <p className="mt-1 text-xs text-slate-500">
              Describe what this project does and your role. {description.length}/500
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Technologies / Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="rounded-full p-0.5 hover:bg-slate-600"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(tagInput);
                }
              }}
              placeholder="Add tag and press Enter"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {suggestedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {suggestedTags.filter((t) => !tags.includes(t)).slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="edit-image" className="block text-sm font-medium text-slate-200 mb-1">
              Featured Image URL <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="edit-image"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/project-screenshot.jpg"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-slate-500">Add a screenshot or demo image (optional).</p>
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-slate-700 max-w-[200px]">
                <img src={imageUrl} alt="Preview" className="w-full h-24 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="edit-demo" className="block text-sm font-medium text-slate-200 mb-1">
              Live Demo URL <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="edit-demo"
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://your-project-demo.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showGithubLink}
              onChange={(e) => setShowGithubLink(e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-200">Show GitHub link in portfolio</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type LoadError = "empty" | "corrupt" | null;

export function CustomizeClient() {
  const { status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<CustomizedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadError>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      // 1) Try selectedRepos (dashboard → customize)
      let raw = sessionStorage.getItem(SELECTED_REPOS_KEY);
      if (raw) {
        const repos: unknown = JSON.parse(raw);
        if (Array.isArray(repos) && repos.length > 0) {
          const customized = repos.map((r: GitHubRepo, i: number) =>
            repoToCustomized(r, i)
          );
          setProjects(customized);
          setLoading(false);
          return;
        }
      }
      // 2) Legacy key
      raw = sessionStorage.getItem(CUSTOMIZE_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          const isRepoShape =
            first &&
            typeof first === "object" &&
            "id" in first &&
            "html_url" in first;
          if (isRepoShape) {
            const customized = (parsed as GitHubRepo[]).map((r, i) =>
              repoToCustomized(r, i)
            );
            setProjects(customized);
            setLoading(false);
            return;
          }
          const asCustomized = parsed as CustomizedProject[];
          const withOrder = asCustomized.map((p, i) => ({ ...p, order: i }));
          setProjects(withOrder);
          setLoading(false);
          return;
        }
      }
      // 3) Previously customized (return visit)
      const customizedRaw = sessionStorage.getItem("autoport_customized");
      if (customizedRaw) {
        const parsed: unknown = JSON.parse(customizedRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const withOrder = (parsed as CustomizedProject[]).map((p, i) => ({
            ...p,
            order: i,
          }));
          setProjects(withOrder);
          setLoading(false);
          return;
        }
      }
      setLoadError("empty");
    } catch {
      sessionStorage.removeItem(SELECTED_REPOS_KEY);
      sessionStorage.removeItem(CUSTOMIZE_STORAGE_KEY);
      setLoadError("corrupt");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }
    if (status === "authenticated") loadFromStorage();
  }, [status, loadFromStorage]);

  const saveToStorage = useCallback((next: CustomizedProject[]) => {
    if (typeof window === "undefined") return;
    setSaveStatus("saving");
    try {
      const toStore = next.map((p) => ({
        id: p.id,
        name: p.originalName,
        description: p.customDescription || p.originalDescription,
        stargazers_count: p.stars,
        language: p.language,
        html_url: p.githubUrl,
      }));
      sessionStorage.setItem(CUSTOMIZE_STORAGE_KEY, JSON.stringify(toStore));
      sessionStorage.setItem("autoport_customized", JSON.stringify(next));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (projects.length === 0 || loading) return;
    const t = setTimeout(() => saveToStorage(projects), 500);
    return () => clearTimeout(t);
  }, [projects, loading, saveToStorage]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setProjects((prev) => {
      const ids = prev.map((p) => p.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((p, i) => ({ ...p, order: i }));
    });
  };

  const handleEdit = (id: string) => setEditingId(id);
  const handleSaveEdit = (updated: CustomizedProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingId(null);
  };
  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i }));
        if (next.length === 0) router.replace("/dashboard?message=select-first");
        return next;
      });
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const validationErrors = useMemo(() => {
    const errs: string[] = [];
    projects.forEach((p, i) => {
      const title = (p.customTitle || p.originalName || "").trim();
      if (!title) errs.push(`Project ${i + 1}: title is required.`);
    });
    return errs;
  }, [projects]);

  const validationWarnings = useMemo(() => {
    const warnings: string[] = [];
    projects.forEach((p, i) => {
      const desc = (p.customDescription || p.originalDescription || "").trim();
      if (desc.length > 0 && desc.length < 10)
        warnings.push(`Project ${i + 1}: consider a longer description (at least 10 characters).`);
      if (p.tags.length === 0)
        warnings.push(`Project ${i + 1}: add technologies to showcase your skills.`);
    });
    return warnings;
  }, [projects]);

  const canProceed = projects.length > 0 && validationErrors.length === 0;

  const suggestions = useMemo(() => {
    const s: { id: string; msg: string }[] = [];
    projects.forEach((p) => {
      if ((p.customDescription || "").trim() === (p.originalDescription || "").trim() && (p.originalDescription || "").length > 0) {
        s.push({ id: p.id, msg: "Consider adding details about your role and impact" });
      }
      if (p.tags.length === 0) {
        s.push({ id: p.id, msg: "Add technologies to help employers find your skills" });
      }
      if (!p.demoUrl?.trim()) {
        s.push({ id: p.id, msg: "Add a live demo link to showcase your work" });
      }
    });
    return s;
  }, [projects]);

  /** Sync current project IDs to dashboard so "Back to Dashboard" shows the same selection (after deletions). */
  const syncSelectionToDashboard = useCallback(() => {
    const ids = projects
      .map((p) => Number(p.id))
      .filter((n) => !Number.isNaN(n));
    try {
      if (ids.length > 0) {
        sessionStorage.setItem(DASHBOARD_SELECTION_KEY, JSON.stringify(ids));
      } else {
        sessionStorage.removeItem(DASHBOARD_SELECTION_KEY);
      }
    } catch (e) {
      console.error("Failed to sync selection to dashboard:", e);
    }
  }, [projects]);

  if (status === "loading" || loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" role="status">
          <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading your projects…</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center">
          <p className="text-slate-200">
            {loadError === "corrupt"
              ? "Selection data was invalid. Please select projects again."
              : "Your selection was lost or expired. Please select projects on the dashboard."}
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  const handleChooseTemplate = () => {
    const hasEmptyTitles = projects.some(
      (p) => !(p.customTitle || p.originalName || "").trim()
    );
    if (hasEmptyTitles) return;
    try {
      sessionStorage.setItem(CUSTOMIZED_PROJECTS_KEY, JSON.stringify(projects));
      router.push("/templates");
    } catch (e) {
      console.error("Failed to save customized projects:", e);
    }
  };

  const editingProject = editingId ? projects.find((p) => p.id === editingId) : null;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/dashboard"
            onClick={syncSelectionToDashboard}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
          Customize Your Projects
        </h1>
        <p className="mt-1 text-slate-400">
          Customizing {projects.length} project{projects.length !== 1 ? "s" : ""}
        </p>

        {validationErrors.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200" role="alert">
            <p className="font-medium">Please fix before choosing a template:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {validationErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {validationWarnings.length > 0 && validationErrors.length === 0 && (
          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-300">
            <p className="font-medium text-slate-200">Suggestions</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-slate-400">
              {validationWarnings.slice(0, 5).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-300">
            <p className="font-medium text-slate-200 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" aria-hidden />
              Suggestions
            </p>
            <ul className="mt-2 space-y-1 text-slate-400">
              {suggestions.slice(0, 3).map((s) => (
                <li key={s.id}>💡 {s.msg}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={projects.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {projects.map((project) => (
                <SortableCard
                  key={project.id}
                  project={project}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {deleteConfirmId && (
          <p className="mt-4 text-sm text-amber-200">
            Click the delete button again to remove this project.
          </p>
        )}
      </div>

      {editingProject && (
        <EditModal
          project={editingProject}
          onClose={() => setEditingId(null)}
          onSave={handleSaveEdit}
        />
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 order-2 sm:order-1">
            <Link
              href="/dashboard"
              onClick={syncSelectionToDashboard}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to Dashboard
            </Link>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              {saveStatus === "saving" && "Saving…"}
              {saveStatus === "saved" && (
                <>
                  <Check className="h-4 w-4 text-emerald-400" aria-hidden />
                  All changes saved
                </>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={handleChooseTemplate}
            disabled={!canProceed}
            className={`order-1 sm:order-2 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
              canProceed
                ? "bg-amber-500 text-slate-950 hover:bg-amber-600"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            Choose Template →
          </button>
        </div>
      </div>
    </main>
  );
}
