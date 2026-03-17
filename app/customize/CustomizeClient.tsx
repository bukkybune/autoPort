"use client";

import type { GitHubRepo } from "../types/github";
import type { CustomizedProject } from "../types/customize";
import {
  SELECTED_REPOS_KEY,
  CUSTOMIZED_PROJECTS_KEY,
  DASHBOARD_SELECTION_KEY,
  CUSTOMIZE_STORAGE_KEY,
} from "../types/customize";
import type { PortfolioConfig, ExperienceEntry, SkillCategory } from "../types/portfolio";
import type { ColorSchemeId, TemplateId } from "../types/portfolio";
import {
  PORTFOLIO_CONFIG_KEY,
  createDefaultPortfolioConfig,
  createDefaultTheme,
  getEmptyExperienceEntry,
  SKILL_LEVELS,
} from "../types/portfolio";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
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
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  X,
  User,
  FileText,
  Code,
  Briefcase,
  Mail,
  Layout,
  Palette,
} from "lucide-react";
import { PreviewTemplate } from "../components/PreviewTemplate";

const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: "minimal-pro", label: "Minimal Pro" },
  { id: "clean-minimal", label: "Clean & Minimal" },
  { id: "aurora", label: "Aurora" },
];

const SUGGESTED_TAGS: Record<string, string[]> = {
  JavaScript: ["JavaScript", "Node.js", "React", "TypeScript"],
  TypeScript: ["TypeScript", "Node.js", "React"],
  Python: ["Python", "Django", "FastAPI", "Flask"],
  "C++": ["C++", "CMake"],
  Go: ["Go"],
  Rust: ["Rust"],
  Java: ["Java", "Spring"],
  Ruby: ["Ruby", "Rails"],
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

function loadProjectsFromStorage(): CustomizedProject[] | null {
  if (typeof window === "undefined") return null;
  try {
    let raw = sessionStorage.getItem(SELECTED_REPOS_KEY);
    if (raw) {
      const repos: unknown = JSON.parse(raw);
      if (Array.isArray(repos) && repos.length > 0) {
        return (repos as GitHubRepo[]).map((r: GitHubRepo, i: number) => repoToCustomized(r, i));
      }
    }
    raw = sessionStorage.getItem(CUSTOMIZED_PROJECTS_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return (parsed as CustomizedProject[]).map((p, i) => ({ ...p, order: p.order ?? i }));
      }
    }
    raw = sessionStorage.getItem("autoport_customized");
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return (parsed as CustomizedProject[]).map((p, i) => ({ ...p, order: p.order ?? i }));
      }
    }
    raw = sessionStorage.getItem(CUSTOMIZE_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (first && typeof first === "object" && "html_url" in first) {
          return (parsed as GitHubRepo[]).map((r, i) => repoToCustomized(r, i));
        }
        return (parsed as CustomizedProject[]).map((p, i) => ({ ...p, order: i }));
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function loadConfigFromStorage(): PortfolioConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PORTFOLIO_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PortfolioConfig;
    if (parsed && typeof parsed === "object" && parsed.hero) return parsed;
  } catch {
    // ignore
  }
  return null;
}

type SectionId = "hero" | "about" | "skills" | "projects" | "experience" | "contact" | "theme";

const COLOR_SCHEMES: { id: ColorSchemeId; label: string; swatch: [string, string, string] }[] = [
  { id: "navy", label: "Navy Blue", swatch: ["#0a192f", "#ccd6f6", "#64ffda"] },
  { id: "purple", label: "Purple Gradient", swatch: ["#1a0b2e", "#e9d5ff", "#ec4899"] },
  { id: "teal", label: "Teal Modern", swatch: ["#0f172a", "#e2e8f0", "#22d3ee"] },
  { id: "green", label: "Forest Green", swatch: ["#052e16", "#dcfce7", "#34d399"] },
  { id: "warm-earth", label: "Warm Earth", swatch: ["#FAF9F6", "#2C2C2C", "#E8A87C"] },
  { id: "ocean-glass", label: "Ocean Glass", swatch: ["#1e3a5f", "#E8F4F8", "#64E9EE"] },
  { id: "sunset-warm", label: "Sunset Warm", swatch: ["#FAF3E0", "#264653", "#E76F51"] },
  { id: "gradient-purple", label: "Gradient Purple", swatch: ["#667eea", "#FFFFFF", "#4FACFE"] },
  { id: "custom", label: "Custom", swatch: ["#1e293b", "#f1f5f9", "#3b82f6"] },
];

const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode; noCheckbox?: boolean }[] = [
  { id: "hero", label: "Hero", icon: <User className="h-4 w-4" /> },
  { id: "about", label: "About Me", icon: <FileText className="h-4 w-4" /> },
  { id: "skills", label: "Skills", icon: <Code className="h-4 w-4" /> },
  { id: "projects", label: "Projects", icon: <Layout className="h-4 w-4" /> },
  { id: "experience", label: "Experience", icon: <Briefcase className="h-4 w-4" /> },
  { id: "contact", label: "Contact", icon: <Mail className="h-4 w-4" /> },
  { id: "theme", label: "Theme & Colors", icon: <Palette className="h-4 w-4" />, noCheckbox: true },
];

function SortableProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: CustomizedProject;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-lg border p-3 transition-all ${
        isDragging ? "border-blue-500 bg-slate-800/80" : "border-slate-700 bg-slate-800/50"
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-manipulation rounded p-1 text-slate-500 hover:text-slate-300"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-200 truncate">
          {project.customTitle || project.originalName}
        </p>
        <p className="text-xs text-slate-500 line-clamp-1">
          {project.customDescription || project.originalDescription || "No description"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(project.id)}
        className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(project.id)}
        className="rounded p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function ProjectEditModal({
  project,
  onClose,
  onSave,
}: {
  project: CustomizedProject;
  onClose: () => void;
  onSave: (p: CustomizedProject) => void;
}) {
  const [title, setTitle] = useState(project.customTitle);
  const [description, setDescription] = useState(project.customDescription);
  const [tags, setTags] = useState<string[]>(project.tags);
  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState(project.imageUrl ?? "");
  const [demoUrl, setDemoUrl] = useState(project.demoUrl ?? "");
  const [showGithubLink, setShowGithubLink] = useState(project.showGithubLink);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-700 px-4 py-3 bg-slate-900">
          <h3 className="font-semibold text-slate-100">Edit Project</h3>
          <button type="button" onClick={onClose} className="rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tags (Enter to add)</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const t = tagInput.trim();
                  if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
                  setTagInput("");
                }
              }}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded bg-slate-700 px-2 py-0.5 text-sm text-slate-200"
                >
                  {tag}
                  <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== tag))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Image URL (optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Demo URL (optional)</label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showGithubLink}
              onChange={(e) => setShowGithubLink(e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-blue-500"
            />
            <span className="text-sm text-slate-300">Show GitHub link</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-2 text-slate-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-500">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CustomizeClient() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<"empty" | "corrupt" | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Resizable panels
  const [sidebarW, setSidebarW] = useState(208);
  const [editorW, setEditorW] = useState(360);
  const draggingPanel = useRef<{ panel: "sidebar" | "editor"; startX: number; startW: number } | null>(null);

  const startPanelResize = useCallback((e: React.MouseEvent, panel: "sidebar" | "editor") => {
    e.preventDefault();
    const startW = panel === "sidebar" ? sidebarW : editorW;
    draggingPanel.current = { panel, startX: e.clientX, startW };
    const onMove = (ev: MouseEvent) => {
      if (!draggingPanel.current) return;
      const delta = ev.clientX - draggingPanel.current.startX;
      if (draggingPanel.current.panel === "sidebar") {
        setSidebarW(Math.max(160, Math.min(320, draggingPanel.current.startW + delta)));
      } else {
        setEditorW(Math.max(280, Math.min(520, draggingPanel.current.startW + delta)));
      }
    };
    const onUp = () => {
      draggingPanel.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [sidebarW, editorW]);

  // Dynamic preview zoom
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewZoom, setPreviewZoom] = useState(0.6);
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () => { if (el.clientWidth > 0) setPreviewZoom(el.clientWidth / 960); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const projectsFromStorage = useMemo(() => loadProjectsFromStorage(), []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }
    if (status !== "authenticated") return;
    try {
      const saved = loadConfigFromStorage();
      const projects = projectsFromStorage;
      if (saved) {
          const withTheme = { ...saved, theme: saved.theme ?? createDefaultTheme() };
          if (projects && projects.length > 0 && (!withTheme.projects?.items?.length || withTheme.projects.items.length === 0)) {
            setConfig({
              ...withTheme,
              projects: { ...withTheme.projects, items: projects.map((p, i) => ({ ...p, order: i })) },
            });
          } else {
            setConfig(withTheme);
          }
        } else {
        if (!projects || projects.length === 0) {
          setLoadError("empty");
          setLoading(false);
          return;
        }
        setConfig(
          createDefaultPortfolioConfig({
            name: session?.user?.name ?? undefined,
            email: session?.user?.email ?? undefined,
            projects,
          })
        );
      }
    } catch {
      setLoadError("corrupt");
    } finally {
      setLoading(false);
    }
  }, [status, session?.user?.name, session?.user?.email, projectsFromStorage, router]);

  useEffect(() => {
    if (!config || typeof window === "undefined") return;
    try {
      sessionStorage.setItem(PORTFOLIO_CONFIG_KEY, JSON.stringify(config));
      sessionStorage.setItem(CUSTOMIZED_PROJECTS_KEY, JSON.stringify(config.projects.items));
    } catch (e) {
      console.error("Failed to save config", e);
    }
  }, [config]);

  const updateConfig = useCallback(<K extends keyof PortfolioConfig>(key: K, value: PortfolioConfig[K]) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleProjectDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setConfig((prev) => {
      if (!prev?.projects.items.length) return prev;
      const items = prev.projects.items;
      const ids = items.map((p) => p.id);
      const o = ids.indexOf(active.id as string);
      const n = ids.indexOf(over.id as string);
      if (o === -1 || n === -1) return prev;
      const reordered = arrayMove(items, o, n).map((p, i) => ({ ...p, order: i }));
      return { ...prev, projects: { ...prev.projects, items: reordered } };
    });
  };

  const handleSaveProject = (updated: CustomizedProject) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const items = prev.projects.items.map((p) => (p.id === updated.id ? updated : p));
      return { ...prev, projects: { ...prev.projects, items } };
    });
    setEditingProjectId(null);
  };

  const handleDeleteProject = (id: string) => {
    if (deleteConfirmId === id) {
      setConfig((prev) => {
        if (!prev) return prev;
        const items = prev.projects.items.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i }));
        return { ...prev, projects: { ...prev.projects, items } };
      });
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const syncSelectionToDashboard = useCallback(() => {
    if (!config?.projects.items.length) return;
    const ids = config.projects.items
      .map((p) => Number(p.id))
      .filter((n) => !Number.isNaN(n));
    try {
      if (ids.length > 0) sessionStorage.setItem(DASHBOARD_SELECTION_KEY, JSON.stringify(ids));
      else sessionStorage.removeItem(DASHBOARD_SELECTION_KEY);
    } catch (e) {
      console.error("Failed to sync selection", e);
    }
  }, [config?.projects.items]);

  const handleChooseTemplate = () => {
    try {
      sessionStorage.setItem(PORTFOLIO_CONFIG_KEY, JSON.stringify(config));
      sessionStorage.setItem(CUSTOMIZED_PROJECTS_KEY, JSON.stringify(config?.projects.items ?? []));
      router.push("/templates");
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  const canProceed = config && config.hero.enabled && (config.hero.name?.trim() || config.projects.items?.length > 0);

  if (status === "loading" || loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" role="status">
          <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center">
          <p className="text-slate-200">
            {loadError === "corrupt"
              ? "Saved data was invalid. Please start from the dashboard."
              : "Select repos on the dashboard first, then customize your portfolio."}
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-600"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!config) return null;

  const editingProject = config.projects.items.find((p) => p.id === editingProjectId);

  return (
    <main className="flex bg-slate-950 text-slate-100" style={{ height: 'calc(100vh - 4rem)', overflow: 'hidden' }}>

      {/* ── Left Sidebar: Section Nav ── */}
      <aside className="shrink-0 border-r border-slate-800/80 bg-slate-900/50 flex flex-col overflow-y-auto pb-12" style={{ width: sidebarW }}>
        <div className="p-4 border-b border-slate-800/60">
          <Link
            href="/dashboard"
            onClick={syncSelectionToDashboard}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
        <div className="p-4 flex-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Sections</p>
          <nav className="space-y-0.5">
            {SECTIONS.map(({ id, label, icon, noCheckbox }) => {
              const section = config[id as keyof PortfolioConfig];
              const enabled = section && typeof section === "object" && "enabled" in section ? (section as { enabled: boolean }).enabled : true;
              return (
                <div key={id} className="flex items-center gap-2">
                  {!noCheckbox && (
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => {
                        const key = id as keyof PortfolioConfig;
                        const sec = config[key];
                        if (sec && typeof sec === "object" && "enabled" in sec) {
                          updateConfig(key, { ...sec, enabled: e.target.checked } as PortfolioConfig[keyof PortfolioConfig]);
                        }
                      }}
                      className="rounded border-slate-600 bg-slate-800 accent-amber-500"
                    />
                  )}
                  {noCheckbox && <span className="w-4" aria-hidden />}
                  <button
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      activeSection === id
                        ? "bg-amber-500/10 text-amber-300 font-medium"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Resize handle: sidebar ↔ editor */}
      <div
        className="w-1 shrink-0 cursor-col-resize bg-slate-800/60 hover:bg-amber-500/50 active:bg-amber-500/70 transition-colors"
        onMouseDown={(e) => startPanelResize(e, "sidebar")}
        title="Drag to resize"
      />

      {/* ── Editor Panel ── */}
      <div className="shrink-0 border-r border-slate-800/80 flex flex-col overflow-hidden" style={{ width: editorW }}>
        <div className="px-5 py-4 border-b border-slate-800/60 shrink-0">
          <h2 className="text-sm font-semibold text-slate-100">
            {SECTIONS.find((s) => s.id === activeSection)?.label}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pb-20">

          {activeSection === "hero" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Name *</label>
                <input
                  type="text"
                  value={config.hero.name}
                  onChange={(e) => updateConfig("hero", { ...config.hero, name: e.target.value })}
                  maxLength={100}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Title / Role</label>
                <input
                  type="text"
                  value={config.hero.title}
                  onChange={(e) => updateConfig("hero", { ...config.hero, title: e.target.value })}
                  placeholder="e.g. Full-Stack Developer"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Bio <span className="normal-case text-slate-500">(max 200)</span></label>
                <textarea
                  value={config.hero.bio}
                  onChange={(e) => updateConfig("hero", { ...config.hero, bio: e.target.value.slice(0, 200) })}
                  maxLength={200}
                  rows={3}
                  placeholder="Short one-liner about yourself"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm resize-y focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Profile photo URL</label>
                <input
                  type="url"
                  value={config.hero.photoUrl ?? ""}
                  onChange={(e) => updateConfig("hero", { ...config.hero, photoUrl: e.target.value.trim() || undefined })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">CTA Text</label>
                  <input
                    type="text"
                    value={config.hero.ctaText ?? ""}
                    onChange={(e) => updateConfig("hero", { ...config.hero, ctaText: e.target.value })}
                    placeholder="e.g. View my work"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">CTA Link</label>
                  <input
                    type="url"
                    value={config.hero.ctaLink ?? ""}
                    onChange={(e) => updateConfig("hero", { ...config.hero, ctaLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === "about" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">About you <span className="normal-case text-slate-500">(max 500)</span></label>
                <textarea
                  value={config.about.description}
                  onChange={(e) => updateConfig("about", { ...config.about, description: e.target.value.slice(0, 500) })}
                  maxLength={500}
                  rows={6}
                  placeholder="Who you are, what you do, what you care about..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm resize-y focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Fun facts / hobbies <span className="normal-case text-slate-500">(max 200)</span></label>
                <textarea
                  value={config.about.funFacts ?? ""}
                  onChange={(e) => updateConfig("about", { ...config.about, funFacts: e.target.value.slice(0, 200) })}
                  maxLength={200}
                  rows={3}
                  placeholder="Optional — interests, hobbies, etc."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm resize-y focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
            </div>
          )}

          {activeSection === "skills" && (
            <div className="space-y-5">
              {config.skills.categories.map((cat, catIndex) => (
                <div key={catIndex} className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => {
                      const next = [...config.skills.categories];
                      next[catIndex] = { ...cat, name: e.target.value };
                      updateConfig("skills", { ...config.skills, categories: next });
                    }}
                    placeholder="Category name"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 text-sm font-medium mb-3 focus:border-amber-500/60 focus:outline-none"
                  />
                  <div className="space-y-2">
                    {cat.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => {
                            const next = [...config.skills.categories];
                            const skills = [...next[catIndex].skills];
                            skills[skillIndex] = { ...skill, name: e.target.value };
                            next[catIndex] = { ...next[catIndex], skills };
                            updateConfig("skills", { ...config.skills, categories: next });
                          }}
                          placeholder="Skill name"
                          className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none"
                        />
                        <select
                          value={skill.level}
                          onChange={(e) => {
                            const next = [...config.skills.categories];
                            const skills = [...next[catIndex].skills];
                            skills[skillIndex] = { ...skill, level: e.target.value };
                            next[catIndex] = { ...next[catIndex], skills };
                            updateConfig("skills", { ...config.skills, categories: next });
                          }}
                          className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none"
                        >
                          {SKILL_LEVELS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...config.skills.categories];
                            next[catIndex] = {
                              ...next[catIndex],
                              skills: next[catIndex].skills.filter((_, i) => i !== skillIndex),
                            };
                            updateConfig("skills", { ...config.skills, categories: next });
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-700 hover:text-red-400 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...config.skills.categories];
                        next[catIndex] = {
                          ...next[catIndex],
                          skills: [...next[catIndex].skills, { name: "", level: "Intermediate" }],
                        };
                        updateConfig("skills", { ...config.skills, categories: next });
                      }}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 mt-1 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add skill
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateConfig("skills", {
                    ...config.skills,
                    categories: [...config.skills.categories, { name: "New category", skills: [] }],
                  })
                }
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add category
              </button>
            </div>
          )}

          {activeSection === "projects" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                {config.projects.items.length} project{config.projects.items.length !== 1 ? 's' : ''}. Drag to reorder; click edit to change details.
              </p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
                <SortableContext
                  items={config.projects.items.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {config.projects.items.map((project) => (
                      <SortableProjectCard
                        key={project.id}
                        project={project}
                        onEdit={setEditingProjectId}
                        onDelete={handleDeleteProject}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {deleteConfirmId && (
                <p className="text-xs text-amber-400">Click remove again to confirm deletion.</p>
              )}
            </div>
          )}

          {activeSection === "experience" && (
            <div className="space-y-5">
              {config.experience.items.map((entry, i) => (
                <div key={i} className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Entry {i + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig("experience", {
                          ...config.experience,
                          items: config.experience.items.filter((_, j) => j !== i),
                        })
                      }
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={entry.company}
                    onChange={(e) => {
                      const next = [...config.experience.items];
                      next[i] = { ...entry, company: e.target.value };
                      updateConfig("experience", { ...config.experience, items: next });
                    }}
                    placeholder="Company"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={entry.role}
                    onChange={(e) => {
                      const next = [...config.experience.items];
                      next[i] = { ...entry, role: e.target.value };
                      updateConfig("experience", { ...config.experience, items: next });
                    }}
                    placeholder="Role / Title"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={entry.duration}
                    onChange={(e) => {
                      const next = [...config.experience.items];
                      next[i] = { ...entry, duration: e.target.value };
                      updateConfig("experience", { ...config.experience, items: next });
                    }}
                    placeholder="Duration (e.g. 2020 – Present)"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none"
                  />
                  <textarea
                    value={entry.description}
                    onChange={(e) => {
                      const next = [...config.experience.items];
                      next[i] = { ...entry, description: e.target.value };
                      updateConfig("experience", { ...config.experience, items: next });
                    }}
                    placeholder="Key responsibilities / achievements"
                    rows={3}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 resize-y focus:border-amber-500/60 focus:outline-none"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateConfig("experience", {
                    ...config.experience,
                    items: [...config.experience.items, getEmptyExperienceEntry()],
                  })
                }
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add experience
              </button>
            </div>
          )}

          {activeSection === "contact" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">Customize the wording for your situation — job seeker, freelancer, student, etc.</p>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Contact headline</label>
                <input
                  type="text"
                  value={config.contact.headline ?? ""}
                  onChange={(e) => updateConfig("contact", { ...config.contact, headline: e.target.value.trim() || undefined })}
                  placeholder="e.g. Get in touch / Let's work together"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Subtext</label>
                <input
                  type="text"
                  value={config.contact.subtext ?? ""}
                  onChange={(e) => updateConfig("contact", { ...config.contact, subtext: e.target.value.trim() || undefined })}
                  placeholder="e.g. Open to opportunities / Available for freelance"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Button label</label>
                <input
                  type="text"
                  value={config.contact.ctaLabel ?? ""}
                  onChange={(e) => updateConfig("contact", { ...config.contact, ctaLabel: e.target.value.trim() || undefined })}
                  placeholder="e.g. Email me / Say hello"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Email *</label>
                <input
                  type="email"
                  value={config.contact.email}
                  onChange={(e) => updateConfig("contact", { ...config.contact, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 pt-1">
                {[
                  { key: 'github' as const, label: 'GitHub URL', placeholder: 'https://github.com/...' },
                  { key: 'linkedin' as const, label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
                  { key: 'twitter' as const, label: 'Twitter / X URL', placeholder: 'https://twitter.com/...' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
                    <input
                      type="url"
                      value={config.contact[key] ?? ""}
                      onChange={(e) => updateConfig("contact", { ...config.contact, [key]: e.target.value.trim() || undefined })}
                      placeholder={placeholder}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "theme" && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Template</label>
                <div className="space-y-2">
                  {TEMPLATE_OPTIONS.map(({ id, label }) => (
                    <label key={id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      (config.theme?.template ?? "minimal-pro") === id
                        ? "border-amber-500/40 bg-amber-500/8"
                        : "border-slate-700 hover:border-slate-600"
                    }`}>
                      <input
                        type="radio"
                        name="template"
                        checked={(config.theme?.template ?? "minimal-pro") === id}
                        onChange={() => updateConfig("theme", { ...config.theme, template: id })}
                        className="accent-amber-500"
                      />
                      <span className="text-slate-200 text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Color scheme</label>
                <div className="space-y-2">
                  {COLOR_SCHEMES.map((scheme) => (
                    <label
                      key={scheme.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        (config.theme?.colorScheme ?? "navy") === scheme.id
                          ? "border-amber-500/40 bg-amber-500/8"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="colorScheme"
                        checked={(config.theme?.colorScheme ?? "navy") === scheme.id}
                        onChange={() =>
                          updateConfig("theme", {
                            ...config.theme,
                            colorScheme: scheme.id,
                            customColors: scheme.id === "custom" ? config.theme?.customColors ?? {
                              primary: "#3b82f6", secondary: "#1e293b", accent: "#3b82f6",
                              background: "#0f172a", text: "#f1f5f9",
                            } : undefined,
                          })
                        }
                        className="accent-amber-500"
                      />
                      <div className="flex gap-1.5">
                        {scheme.swatch.map((c, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded-md border border-slate-600 shrink-0"
                            style={{ backgroundColor: c }}
                            aria-hidden
                          />
                        ))}
                      </div>
                      <span className="text-slate-200 text-sm">{scheme.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {(config.theme?.colorScheme ?? "navy") === "custom" && (
                <div className="rounded-xl border border-slate-700 p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Custom colors</p>
                  {(["primary", "secondary", "accent", "background", "text"] as const).map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-sm text-slate-400 w-24 capitalize">{key}</label>
                      <input
                        type="color"
                        value={config.theme?.customColors?.[key] ?? "#3b82f6"}
                        onChange={(e) =>
                          updateConfig("theme", {
                            ...config.theme,
                            customColors: {
                              ...(config.theme?.customColors ?? {
                                primary: "#3b82f6", secondary: "#1e293b", accent: "#3b82f6",
                                background: "#0f172a", text: "#f1f5f9",
                              }),
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="w-10 h-10 rounded-lg cursor-pointer border border-slate-600"
                      />
                      <input
                        type="text"
                        value={config.theme?.customColors?.[key] ?? ""}
                        onChange={(e) =>
                          updateConfig("theme", {
                            ...config.theme,
                            customColors: {
                              ...(config.theme?.customColors ?? {
                                primary: "#3b82f6", secondary: "#1e293b", accent: "#3b82f6",
                                background: "#0f172a", text: "#f1f5f9",
                              }),
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-slate-100 text-sm font-mono focus:border-amber-500/60 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Resize handle: editor ↔ preview */}
      <div
        className="w-1 shrink-0 cursor-col-resize bg-slate-800/60 hover:bg-amber-500/50 active:bg-amber-500/70 transition-colors"
        onMouseDown={(e) => startPanelResize(e, "editor")}
        title="Drag to resize"
      />

      {/* ── Live Preview Panel ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-950">
        {/* Browser chrome (merged with toolbar) */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-700/50">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/50" />
            <div className="h-3 w-3 rounded-full bg-amber-400/50" />
            <div className="h-3 w-3 rounded-full bg-green-400/50" />
          </div>
          <div className="flex-1 rounded-md bg-slate-700/50 px-3 py-1 text-xs text-slate-400 truncate">
            {config.hero.name
              ? `${config.hero.name.toLowerCase().replace(/\s+/g, "")}.portfolio.dev`
              : "your-portfolio.dev"}
          </div>
          <a
            href="/customize/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            ↗
          </a>
        </div>

        {/* Template preview — zoom fills panel width exactly */}
        <div ref={previewRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          <div style={{ zoom: previewZoom, width: "960px" }}>
            <PreviewTemplate config={config} />
          </div>
        </div>
      </div>

      {editingProject && (
        <ProjectEditModal
          project={editingProject}
          onClose={() => setEditingProjectId(null)}
          onSave={handleSaveProject}
        />
      )}

      {/* Bottom bar */}
      <div className="fixed bottom-0 right-0 z-30 border-t border-slate-800 bg-slate-900/95 backdrop-blur" style={{ left: sidebarW + editorW + 4 }}>
        <div className="flex items-center justify-between px-5 py-3">
          <Link
            href="/dashboard"
            onClick={syncSelectionToDashboard}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <button
            type="button"
            onClick={handleChooseTemplate}
            disabled={!canProceed}
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors ${
              canProceed
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm shadow-amber-500/20"
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
